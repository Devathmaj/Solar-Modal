/**
 * TerrainTile — a single terrain mesh tile with heightmap-driven displacement.
 *
 * Each tile is a PlaneGeometry whose vertex Y positions are set from
 * the generated heightmap. The mesh uses the planet's surface texture
 * as albedo and derives normals from the heightmap for proper lighting.
 *
 * Tiles are created lazily and cached. When the camera moves, the parent
 * TerrainGrid component determines which tiles to show at which LOD level.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetTerrainConfig } from './terrainConfig'
import { generateTileHeightmap, heightmapToNormals } from './heightmapGenerator'

export interface TerrainTileProps {
  /** World-space X origin of this tile. */
  originX: number
  /** World-space Z origin of this tile. */
  originZ: number
  /** World-space size of the tile (square). */
  tileSize: number
  /** Mesh subdivisions per edge. */
  segments: number
  /** Planet terrain configuration. */
  config: PlanetTerrainConfig
  /** Pre-generated crater array (shared across all tiles). */
  craters: Array<{ x: number; z: number; r: number }>
  /** Unique seed for this tile (derived from tile coordinates). */
  tileSeed: number
}

/**
 * Creates a single terrain tile mesh with heightmap displacement.
 *
 * The geometry is a PlaneGeometry rotated to horizontal (XZ plane),
 * with vertex Y displaced by the heightmap. Normals are computed from
 * the heightmap gradient for correct lighting at all scales.
 */
export function TerrainTile({
  originX,
  originZ,
  tileSize,
  segments,
  config,
  craters,
  tileSeed,
}: TerrainTileProps) {
  const gl = useThree((state) => state.gl)
  const meshRef = useRef<THREE.Mesh>(null)

  const map = config.texturePath ? useTexture(config.texturePath) : null

  useEffect(() => {
    if (map) {
      map.colorSpace = THREE.SRGBColorSpace
      map.wrapS = THREE.RepeatWrapping
      map.wrapT = THREE.RepeatWrapping
      map.anisotropy = gl.capabilities.getMaxAnisotropy()
      map.needsUpdate = true
    }
  }, [map, gl])

  const { geometry, material } = useMemo(() => {
    const plane = new THREE.PlaneGeometry(tileSize, tileSize, segments, segments)
    plane.rotateX(-Math.PI / 2)

    // Generate heightmap from noise
    const heightmap = generateTileHeightmap(
      originX,
      originZ,
      tileSize,
      segments,
      config,
      craters,
    )

    // Apply heightmap to vertex positions
    const posAttr = plane.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const z = posAttr.getZ(i)

      // Map vertex position to heightmap index
      const gridX = Math.round(((x + tileSize / 2) / tileSize) * segments)
      const gridZ = Math.round(((z + tileSize / 2) / tileSize) * segments)
      const hIdx = Math.max(0, Math.min(segments, gridZ)) * (segments + 1) +
                   Math.max(0, Math.min(segments, gridX))

      posAttr.setY(i, heightmap[hIdx])
    }
    posAttr.needsUpdate = true

    // Compute normals from heightmap gradient (much smoother than geometry normals)
    const computedNormals = heightmapToNormals(heightmap, segments, tileSize)
    const normalAttr = plane.attributes.normal as THREE.BufferAttribute
    for (let i = 0; i < normalAttr.count; i++) {
      normalAttr.setXYZ(i, computedNormals[i * 3], computedNormals[i * 3 + 1], computedNormals[i * 3 + 2])
    }
    normalAttr.needsUpdate = true

    plane.computeBoundingSphere()

    // Create material with surface texture
    const materialConfig: THREE.MeshStandardMaterialParameters = {
      roughness: config.roughness,
      metalness: config.metalness,
      color: new THREE.Color(config.surfaceTint),
    }

    if (map) {
      const surfaceMap = map.clone()
      surfaceMap.wrapS = THREE.RepeatWrapping
      surfaceMap.wrapT = THREE.RepeatWrapping
      // Scale texture repeat based on tile size
      const repeat = Math.max(1, Math.round(tileSize / 20))
      surfaceMap.repeat.set(repeat, repeat)
      surfaceMap.colorSpace = THREE.SRGBColorSpace
      surfaceMap.anisotropy = gl.capabilities.getMaxAnisotropy()
      surfaceMap.needsUpdate = true

      materialConfig.map = surfaceMap
      materialConfig.bumpMap = surfaceMap
      materialConfig.bumpScale = config.bumpScale
    }

    const mat = new THREE.MeshStandardMaterial(materialConfig)

    return { geometry: plane, material: mat }
  }, [originX, originZ, tileSize, segments, config, craters, tileSeed, map, gl])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
      if (material.map) material.map.dispose()
      if (material.bumpMap && material.bumpMap !== material.map) {
        material.bumpMap.dispose()
      }
    }
  }, [geometry, material])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      position={[originX + tileSize / 2, 0, originZ + tileSize / 2]}
    />
  )
}
