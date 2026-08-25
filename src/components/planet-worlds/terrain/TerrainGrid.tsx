/**
 * TerrainGrid — manages the LOD tile grid for a planet's terrain.
 *
 * This component tracks the camera position and determines which tiles
 * to load at which LOD level. Tiles are arranged in a grid centered on
 * the camera's XZ position, with higher-resolution tiles loaded nearest
 * to the viewer and lower-resolution tiles filling the background.
 *
 * Tile lifecycle:
 *  1. Camera position determines grid center
 *  2. For each LOD level, compute which tile coordinates fall in range
 *  3. Tiles within loadDistance of camera → load at that LOD's segments
 *  4. Tiles beyond all LOD ranges → unload
 *  5. Craters are generated once and shared across all tiles
 */

import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PlanetTerrainConfig } from './terrainConfig'
import { TerrainTile } from './TerrainTile'
import { generateCraters } from './heightmapGenerator'

interface TerrainGridProps {
  config: PlanetTerrainConfig
}

interface TileKey {
  gx: number
  gz: number
  lod: number
}

/**
 * Computes which tiles to display based on camera distance.
 * Returns an array of tile descriptors to render.
 */
function computeVisibleTiles(
  cameraX: number,
  cameraZ: number,
  config: PlanetTerrainConfig,
): TileKey[] {
  const visible: TileKey[] = []
  const seen = new Set<string>()

  // Process LOD levels from finest to coarsest
  for (let lod = 0; lod < config.lodLevels.length; lod++) {
    const level = config.lodLevels[lod]
    const halfExtent = level.loadDistance
    const tileSize = level.tileSize

    // Grid range covering the load distance
    const minGx = Math.floor((cameraX - halfExtent) / tileSize)
    const maxGx = Math.ceil((cameraX + halfExtent) / tileSize)
    const minGz = Math.floor((cameraZ - halfExtent) / tileSize)
    const maxGz = Math.ceil((cameraZ + halfExtent) / tileSize)

    for (let gz = minGz; gz <= maxGz; gz++) {
      for (let gx = minGx; gx <= maxGx; gx++) {
        const key = `${gx},${gz}`

        // Skip if already claimed by a finer LOD
        if (seen.has(key)) continue

        // Check if this tile's center is within the LOD's load distance
        const tileCenterX = (gx + 0.5) * tileSize
        const tileCenterZ = (gz + 0.5) * tileSize
        const dist = Math.hypot(tileCenterX - cameraX, tileCenterZ - cameraZ)

        if (dist <= level.loadDistance) {
          seen.add(key)
          visible.push({ gx, gz, lod })
        }
      }
    }
  }

  return visible
}

/**
 * TerrainGrid manages the tile-based terrain system.
 *
 * It does NOT render tiles directly — instead it computes the visible
 * tile set each frame (with throttling) and passes it to child render.
 */
export function TerrainGrid({ config }: TerrainGridProps) {
  const camera = useThree((state) => state.camera)
  const lastUpdateRef = useRef({ x: 0, z: 0, time: 0 })

  // Generate craters once — shared across all tiles
  const craters = useMemo(() => generateCraters(config), [config])

  // Current visible tiles (updated periodically, not every frame)
  const tilesRef = useRef<TileKey[]>([])

  // Force re-render when tiles change
  const [visibleTiles, setVisibleTiles] = useState<TileKey[]>(() =>
    computeVisibleTiles(0, 0, config),
  )

  useFrame(() => {
    const now = performance.now()
    const camX = camera.position.x
    const camZ = camera.position.z
    const last = lastUpdateRef.current

    // Throttle tile updates to every 200ms or when camera moves significantly
    const moved = Math.hypot(camX - last.x, camZ - last.z)
    if (now - last.time < 200 && moved < 10) return

    lastUpdateRef.current = { x: camX, z: camZ, time: now }

    const newTiles = computeVisibleTiles(camX, camZ, config)

    // Check if tiles actually changed
    if (newTiles.length !== tilesRef.current.length) {
      tilesRef.current = newTiles
      setVisibleTiles(newTiles)
      return
    }

    let changed = false
    for (let i = 0; i < newTiles.length; i++) {
      const a = newTiles[i]
      const b = tilesRef.current[i]
      if (a.gx !== b.gx || a.gz !== b.gz || a.lod !== b.lod) {
        changed = true
        break
      }
    }

    if (changed) {
      tilesRef.current = newTiles
      setVisibleTiles(newTiles)
    }
  })

  return (
    <group>
      {visibleTiles.map((tile) => {
        const level = config.lodLevels[tile.lod]
        const originX = tile.gx * level.tileSize
        const originZ = tile.gz * level.tileSize

        return (
          <TerrainTile
            key={`${tile.gx},${tile.gz},${tile.lod}`}
            originX={originX}
            originZ={originZ}
            tileSize={level.tileSize}
            segments={level.segments}
            config={config}
            craters={craters}
            tileSeed={tile.gx * 73856093 + tile.gz * 19349669}
          />
        )
      })}
    </group>
  )
}
