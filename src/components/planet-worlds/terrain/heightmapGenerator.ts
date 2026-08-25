/**
 * Procedural heightmap generator for planetary terrain.
 *
 * Uses multi-octave simplex-like noise to generate elevation data that
 * drives actual 3D mesh displacement. Each planet's noise characteristics
 * are derived from its real geological features:
 *
 *  - Mercury: crater-dominated with flat intercrater plains
 *  - Venus: volcanic ridges and smooth plains
 *  - Earth: varied tectonic terrain (mountains, valleys, plains)
 *  - Mars: crater + dune + cliff terrain (highest detail)
 *
 * Heightmaps are generated as Float32Arrays and cached per tile coordinate.
 * The generator does NOT load external datasets at runtime — noise parameters
 * in terrainConfig.ts encode the planet's elevation characteristics.
 *
 * For production use with real DTM data, the Float32Array can be replaced
 * with a decoded heightmap texture (grayscale PNG or KTX2).
 */

import type { NoiseOctave, PlanetTerrainConfig } from './terrainConfig'

/* ------------------------------------------------------------------ */
/* Deterministic hash-based noise                                      */
/* ------------------------------------------------------------------ */

/**
 * High-quality 2D value noise using a hash-based approach.
 * Returns a value in [-1, 1].
 */
function hashNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  // Smooth interpolation
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)

  const hash = (x: number, y: number): number => {
    let h = (x * 374761393 + y * 668265263 + seed * 1274126177) | 0
    h = (h ^ (h >> 13)) * 1274126177
    h = h ^ (h >> 16)
    return (h & 0x7fffffff) / 0x7fffffff
  }

  const n00 = hash(ix, iy) * 2 - 1
  const n10 = hash(ix + 1, iy) * 2 - 1
  const n01 = hash(ix, iy + 1) * 2 - 1
  const n11 = hash(ix + 1, iy + 1) * 2 - 1

  const nx0 = n00 + (n10 - n00) * u
  const nx1 = n01 + (n11 - n01) * u

  return nx0 + (nx1 - nx0) * v
}

/**
 * Fractal Brownian Motion — stacks multiple octaves of noise.
 * Octaves accumulate (no normalization) so each octave's amplitude
 * contributes directly to the final height. This preserves the full
 * elevation range defined by the octave amplitudes.
 */
function fbm(
  x: number,
  y: number,
  octaves: NoiseOctave[],
): number {
  let value = 0

  for (let i = 0; i < octaves.length; i++) {
    const { frequency, amplitude, seed } = octaves[i]
    value += hashNoise2D(x * frequency, y * frequency, seed) * amplitude
  }

  return value
}

/* ------------------------------------------------------------------ */
/* Crater heightfield                                                  */
/* ------------------------------------------------------------------ */

interface Crater {
  x: number
  z: number
  r: number
}

/**
 * Pre-computes crater positions and returns a height function.
 * Identical algorithm to the existing makeCraterField in worldAssets.ts
 * but separated for use in the tile-based terrain system.
 */
function makeCraterHeightFn(
  craters: Crater[],
  depth: number,
  rim: number,
): (x: number, z: number) => number {
  return (x: number, z: number) => {
    let contribution = 0
    for (let i = 0; i < craters.length; i++) {
      const c = craters[i]
      const d = Math.hypot(x - c.x, z - c.z)
      if (d > c.r * 1.5) continue
      const t = d / c.r

      if (t < 1) {
        const bowl = 0.5 + 0.5 * Math.cos(t * Math.PI)
        contribution -= depth * bowl
      }

      const rimT = (t - 1) / 0.3
      contribution += depth * rim * Math.exp(-rimT * rimT)
    }
    return contribution
  }
}

/* ------------------------------------------------------------------ */
/* Heightmap generation                                                */
/* ------------------------------------------------------------------ */

/**
 * Generate a heightmap for a terrain tile.
 *
 * @param originX  World-space X origin of the tile
 * @param originZ  World-space Z origin of the tile
 * @param size     World-space size of the tile (square)
 * @param segments Number of vertices per edge
 * @param config   Planet terrain configuration
 * @param craters  Pre-computed crater array (optional)
 * @returns        Float32Array of elevation values (segments+1 × segments+1)
 */
export function generateTileHeightmap(
  originX: number,
  originZ: number,
  size: number,
  segments: number,
  config: PlanetTerrainConfig,
  craters?: Crater[],
): Float32Array {
  const vertexCount = (segments + 1) * (segments + 1)
  const heightmap = new Float32Array(vertexCount)
  const octaves = config.octaves ?? []

  const craterFn = craters && config.craters
    ? makeCraterHeightFn(craters, config.craters.depth, config.craters.rim)
    : null

  const step = size / segments

  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const worldX = originX + ix * step
      const worldZ = originZ + iz * step

      // Multi-octave noise displacement
      let height = fbm(worldX, worldZ, octaves) * config.elevationScale

      // Add a secondary noise pass for finer detail
      const detailNoise = hashNoise2D(
        worldX * config.baseFrequency * 3.13 + 5,
        worldZ * config.baseFrequency * 3.07 + 9,
        42.7,
      )
      height += detailNoise * config.elevationScale * 0.22

      // Crater carving
      if (craterFn) {
        height += craterFn(worldX, worldZ)
      }

      // Edge falloff — smooth transition at terrain boundary
      const distFromCenter = Math.hypot(worldX, worldZ)
      const falloff = smoothstep(distFromCenter, config.falloffStart, config.terrainRadius - 50)
      height *= 1 - falloff

      // Curvature drop — simulates planetary curvature
      if (config.curvatureRadius > 0) {
        const r2 = worldX * worldX + worldZ * worldZ
        height -= config.curvatureRadius - Math.sqrt(
          Math.max(config.curvatureRadius * config.curvatureRadius - r2, 0),
        )
      }

      heightmap[iz * (segments + 1) + ix] = height
    }
  }

  return heightmap
}

/**
 * Generate a crater field for a terrain region.
 * Craters are placed randomly but avoid the center content-anchor area.
 */
export function generateCraters(config: PlanetTerrainConfig): Crater[] {
  if (!config.craters) return []

  const { count, minRadius, maxRadius } = config.craters
  const craters: Crater[] = []

  for (let i = 0; i < count; i++) {
    let x = 0
    let z = 0
    do {
      x = (Math.random() - 0.5) * config.terrainRadius * 1.4
      z = (Math.random() - 0.5) * config.terrainRadius * 1.4
    } while (Math.hypot(x, z) < 20)

    craters.push({
      x,
      z,
      r: minRadius + Math.random() * (maxRadius - minRadius),
    })
  }

  return craters
}

/**
 * Get the terrain height at a world-space (x, z) point.
 * Used for placing boulders, particles, and content items on the terrain.
 */
export function sampleTerrainHeight(
  x: number,
  z: number,
  config: PlanetTerrainConfig,
  craters?: Crater[],
): number {
  const octaves = config.octaves ?? []

  let height = fbm(x, z, octaves) * config.elevationScale

  const detailNoise = hashNoise2D(
    x * config.baseFrequency * 3.13 + 5,
    z * config.baseFrequency * 3.07 + 9,
    42.7,
  )
  height += detailNoise * config.elevationScale * 0.22

  if (craters && config.craters) {
    const craterFn = makeCraterHeightFn(craters, config.craters.depth, config.craters.rim)
    height += craterFn(x, z)
  }

  const distFromCenter = Math.hypot(x, z)
  const falloff = smoothstep(distFromCenter, config.falloffStart, config.terrainRadius - 50)
  height *= 1 - falloff

  if (config.curvatureRadius > 0) {
    const r2 = x * x + z * z
    height -= config.curvatureRadius - Math.sqrt(
      Math.max(config.curvatureRadius * config.curvatureRadius - r2, 0),
    )
  }

  return height
}

/**
 * Generate a normal map from a heightmap.
 * Returns a new Float32Array of (nx, ny, nz) per vertex, suitable for
 * uploading as a normal map or computing smooth normals on the mesh.
 */
export function heightmapToNormals(
  heightmap: Float32Array,
  segments: number,
  tileSize: number,
): Float32Array {
  const normals = new Float32Array((segments + 1) * (segments + 1) * 3)
  const step = tileSize / segments
  const invStep = 1 / step

  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const idx = iz * (segments + 1) + ix
      const hL = ix > 0 ? heightmap[idx - 1] : heightmap[idx]
      const hR = ix < segments ? heightmap[idx + 1] : heightmap[idx]
      const hU = iz > 0 ? heightmap[(iz - 1) * (segments + 1) + ix] : heightmap[idx]
      const hD = iz < segments ? heightmap[(iz + 1) * (segments + 1) + ix] : heightmap[idx]

      const nx = (hL - hR) * invStep
      const nz = (hU - hD) * invStep
      const ny = 2.0

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
      normals[idx * 3] = nx / len
      normals[idx * 3 + 1] = ny / len
      normals[idx * 3 + 2] = nz / len
    }
  }

  return normals
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
