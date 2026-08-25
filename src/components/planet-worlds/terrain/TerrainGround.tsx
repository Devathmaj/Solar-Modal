/**
 * TerrainGround — reliable single-mesh terrain that always renders.
 *
 * Replaces the tile-based TerrainGrid with a single large PlaneGeometry
 * centered at the origin, displaced by heightmap noise. This guarantees
 * the terrain is visible from any camera position without LOD tile-loading
 * race conditions.
 *
 * The mesh is large enough that the user cannot see the edge, and vertex
 * displacement creates real 3D terrain shape (craters, hills, valleys).
 */

import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetTerrainConfig } from './terrainConfig'
import { generateTileHeightmap, generateCraters } from './heightmapGenerator'

interface TerrainGroundProps {
  config: PlanetTerrainConfig
}

export function TerrainGround({ config }: TerrainGroundProps) {
  const gl = useThree((state) => state.gl)
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

  // Generate craters once
  const craters = useMemo(() => generateCraters(config), [config])

  const { geometry, material } = useMemo(() => {
    // Single large mesh covering the entire terrain radius
    const size = config.terrainRadius * 2
    const segments = 200

    const plane = new THREE.PlaneGeometry(size, size, segments, segments)
    plane.rotateX(-Math.PI / 2)

    // Generate heightmap for the full terrain extent
    const heightmap = generateTileHeightmap(
      -config.terrainRadius,
      -config.terrainRadius,
      size,
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
      const gridX = Math.round(((x + config.terrainRadius) / size) * segments)
      const gridZ = Math.round(((z + config.terrainRadius) / size) * segments)
      const hIdx = Math.max(0, Math.min(segments, gridZ)) * (segments + 1) +
                   Math.max(0, Math.min(segments, gridX))

      posAttr.setY(i, heightmap[hIdx])
    }
    posAttr.needsUpdate = true

    // Compute normals directly from heightmap gradient (cross product of
    // tangent vectors). This gives the exact surface normal at every vertex
    // regardless of curvature or sharp elevation changes.
    const normalAttr = plane.attributes.normal as THREE.BufferAttribute
    for (let iz = 0; iz <= segments; iz++) {
      for (let ix = 0; ix <= segments; ix++) {
        const idx = iz * (segments + 1) + ix

        // Height of neighboring vertices (clamp at edges)
        const hL = ix > 0 ? heightmap[idx - 1] : heightmap[idx]
        const hR = ix < segments ? heightmap[idx + 1] : heightmap[idx]
        const hU = iz > 0 ? heightmap[(iz - 1) * (segments + 1) + ix] : heightmap[idx]
        const hD = iz < segments ? heightmap[(iz + 1) * (segments + 1) + ix] : heightmap[idx]

        // Tangent vectors along the surface.
        // World Z is inverted relative to heightmap iz (plane.rotateX(-PI/2)),
        // so the world-space Z gradient is (hD - hU), not (hU - hD).
        const invStep = segments / size
        const dx = (hL - hR) * invStep
        const dz = (hD - hU) * invStep

        // Normal = cross product of tangent vectors (unnormalized then normalized)
        const nx = dx
        const ny = 1.0
        const nz = dz
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1

        normalAttr.setXYZ(idx, nx / len, ny / len, nz / len)
      }
    }
    normalAttr.needsUpdate = true

    plane.computeBoundingSphere()

    // Create material
    const materialParams: THREE.MeshStandardMaterialParameters = {
      roughness: config.roughness,
      metalness: config.metalness,
      color: new THREE.Color(config.surfaceTint),
    }

    if (map) {
      const surfaceMap = map.clone()
      surfaceMap.wrapS = THREE.RepeatWrapping
      surfaceMap.wrapT = THREE.RepeatWrapping
      const repeat = Math.max(1, Math.round(size / 30))
      surfaceMap.repeat.set(repeat, repeat)
      surfaceMap.colorSpace = THREE.SRGBColorSpace
      surfaceMap.anisotropy = gl.capabilities.getMaxAnisotropy()
      surfaceMap.needsUpdate = true
      materialParams.map = surfaceMap
    }

    const mat = new THREE.MeshStandardMaterial(materialParams)

    return { geometry: plane, material: mat }
  }, [config, craters, map, gl])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
      if (material.map) material.map.dispose()
    }
  }, [geometry, material])

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  )
}
