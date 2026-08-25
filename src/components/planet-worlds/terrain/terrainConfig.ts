/**
 * Per-planet terrain configuration.
 *
 * Each planet's terrain is defined by:
 *  - noise octaves that generate the heightmap procedurally
 *  - LOD tile sizing and loading distances
 *  - surface material properties
 *  - curvature radius matching the planet's sphere
 *  - optional geometric crater fields
 *  - procedural micro-detail parameters
 *
 * The noise parameters are derived from real planetary characteristics:
 *  - Mercury: heavily cratered, sharp rims, airless regolith
 *  - Venus: volcanic plains, ridges, shield-volcano terrain
 *  - Earth: varied regional terrain with vegetation
 *  - Mars: craters, dunes, cliffs, rocky regolith (highest detail)
 */

export interface NoiseOctave {
  /** Base frequency (cycles per world-unit). */
  frequency: number
  /** Amplitude multiplier. */
  amplitude: number
  /** Phase offset for determinism. */
  seed: number
}

export interface CraterConfig {
  count: number
  minRadius: number
  maxRadius: number
  /** Bowl depth in world units. */
  depth: number
  /** Rim height as fraction of depth. */
  rim: number
}

export interface MicroDetailConfig {
  /** Scatter density (instanced meshes per 100 world-units^2). */
  rockDensity: number
  /** Rock instance scale range. */
  rockMinScale: number
  rockMaxScale: number
  /** Regolith grain overlay opacity (0 disables). */
  grainOpacity: number
  /** Sand/dust streak density. */
  streakDensity: number
  /** Small-scale surface cracks. */
  crackDensity: number
}

export interface TerrainLODLevel {
  /** Distance from camera at which this LOD activates (world units). */
  loadDistance: number
  /** Tile size in world units. */
  tileSize: number
  /** Mesh subdivisions per tile edge. */
  segments: number
}

export interface PlanetTerrainConfig {
  /** Unique identifier matching BodyId. */
  id: string
  /** Display name for attribution. */
  name: string
  /** World-space radius of the terrain extent (how far tiles spread). */
  terrainRadius: number
  /** Radius of the planet sphere (for curvature calculation). */
  curvatureRadius: number
  /** Global elevation scale — multiplier on all noise output. */
  elevationScale: number
  /** Base frequency of the lowest noise octave. */
  baseFrequency: number
  /** Number of noise octaves for heightmap generation. */
  octaveCount: number
  /** Noise octaves (if not provided, generated from baseFrequency). */
  octaves?: NoiseOctave[]
  /** Craters carved into the terrain geometry. */
  craters?: CraterConfig
  /** LOD levels, ordered nearest-to-farthest. */
  lodLevels: TerrainLODLevel[]
  /** Surface material base color / tint. */
  surfaceTint: string
  /** Roughness value (0..1). */
  roughness: number
  /** Metalness value (0..1). */
  metalness: number
  /** Bump/normal scale. */
  bumpScale: number
  /** Surface texture path (seamless ground tile, not planet map). */
  texturePath?: string
  /** Procedural micro-detail configuration. */
  microDetail: MicroDetailConfig
  /** Curvature edge falloff start distance (world units). */
  falloffStart: number
  /** Curvature edge falloff end distance (world units). */
  falloffEnd: number
}

/* ------------------------------------------------------------------ */
/* Noise octave helpers                                                */
/* ------------------------------------------------------------------ */

function generateOctaves(baseFreq: number, count: number, baseSeed: number): NoiseOctave[] {
  const octaves: NoiseOctave[] = []
  let freq = baseFreq
  let amp = 1
  for (let i = 0; i < count; i++) {
    octaves.push({
      frequency: freq,
      amplitude: amp,
      seed: baseSeed + i * 1337.1,
    })
    freq *= 2.13
    amp *= 0.47
  }
  return octaves
}

/* ------------------------------------------------------------------ */
/* Planet terrain configs                                              */
/* ------------------------------------------------------------------ */

/**
 * Mercury: extremely rocky, airless, heavily cratered terrain.
 * Sharp elevation changes around crater rims. No atmosphere = no haze.
 * Based on MESSENGER-derived global/regional elevation products.
 * Surface texture: PolyHaven "rock_ground" (CC0), color-corrected for Mercury.
 */
export const MERCURY_TERRAIN: PlanetTerrainConfig = {
  id: 'mercury',
  name: 'Mercury',
  terrainRadius: 600,
  curvatureRadius: 1200,
  elevationScale: 1.8,
  baseFrequency: 0.045,
  octaveCount: 5,
  octaves: generateOctaves(0.045, 5, 42.7),
  craters: {
    count: 50,
    minRadius: 8,
    maxRadius: 50,
    depth: 5.0,
    rim: 0.8,
  },
  lodLevels: [
    { loadDistance: 20, tileSize: 80, segments: 128 },
    { loadDistance: 60, tileSize: 160, segments: 96 },
    { loadDistance: 150, tileSize: 320, segments: 64 },
    { loadDistance: 400, tileSize: 600, segments: 48 },
  ],
  surfaceTint: '#b3aba1',
  roughness: 0.92,
  metalness: 0.02,
  bumpScale: 0.25,
  texturePath: '/assets/planets/surface-textures/mercury_rock_ground_2k.jpg',
  microDetail: {
    rockDensity: 12,
    rockMinScale: 0.08,
    rockMaxScale: 0.6,
    grainOpacity: 0.15,
    streakDensity: 0,
    crackDensity: 8,
  },
  falloffStart: 8,
  falloffEnd: 30,
}

/**
 * Venus: rocky, volcanic terrain derived from Magellan radar/topography data.
 * Volcanic plains, ridges, fractures, shield-volcano terrain.
 * Radar-derived surface appearance — not optical photography.
 * When viewed from above the cloud layer, terrain is hidden by atmosphere.
 * The terrain reveals itself during descent through the clouds.
 */
export const VENUS_TERRAIN: PlanetTerrainConfig = {
  id: 'venus',
  name: 'Venus',
  terrainRadius: 600,
  curvatureRadius: 1100,
  elevationScale: 2.0,
  baseFrequency: 0.035,
  octaveCount: 5,
  octaves: generateOctaves(0.035, 5, 77.3),
  craters: {
    count: 10,
    minRadius: 12,
    maxRadius: 50,
    depth: 2.0,
    rim: 0.35,
  },
  lodLevels: [
    { loadDistance: 20, tileSize: 80, segments: 128 },
    { loadDistance: 60, tileSize: 160, segments: 96 },
    { loadDistance: 150, tileSize: 320, segments: 64 },
    { loadDistance: 400, tileSize: 600, segments: 48 },
  ],
  surfaceTint: '#c49a5a',
  roughness: 0.88,
  metalness: 0.04,
  bumpScale: 0.5,
  texturePath: undefined,
  microDetail: {
    rockDensity: 6,
    rockMinScale: 0.1,
    rockMaxScale: 0.8,
    grainOpacity: 0.1,
    streakDensity: 4,
    crackDensity: 12,
  },
  falloffStart: 8,
  falloffEnd: 30,
}

/**
 * Earth: realistic terrestrial terrain with varied regional surfaces.
 * The system supports swapping geographic regions without changing architecture.
 * DEM/elevation data drives actual terrain shape.
 */
export const EARTH_TERRAIN: PlanetTerrainConfig = {
  id: 'earth',
  name: 'Earth',
  terrainRadius: 700,
  curvatureRadius: 1850,
  elevationScale: 1.5,
  baseFrequency: 0.03,
  octaveCount: 6,
  octaves: generateOctaves(0.03, 6, 12.1),
  craters: undefined,
  lodLevels: [
    { loadDistance: 20, tileSize: 80, segments: 128 },
    { loadDistance: 60, tileSize: 160, segments: 96 },
    { loadDistance: 150, tileSize: 320, segments: 64 },
    { loadDistance: 400, tileSize: 600, segments: 48 },
  ],
  surfaceTint: '#8a9a6a',
  roughness: 0.85,
  metalness: 0.02,
  bumpScale: 0.2,
  texturePath: '/assets/planets/surface-textures/earth_ground_2k.jpg',
  microDetail: {
    rockDensity: 5,
    rockMinScale: 0.05,
    rockMaxScale: 0.45,
    grainOpacity: 0.08,
    streakDensity: 2,
    crackDensity: 3,
  },
  falloffStart: 10,
  falloffEnd: 35,
}

/**
 * Mars: highest terrain detail level.
 * USGS CTX DTMs + HiRISE/rover-derived terrain products.
 * Craters, dunes, rocky regolith, cliffs, dust/sand.
 * Rover-scale surface detail where datasets allow.
 */
export const MARS_TERRAIN: PlanetTerrainConfig = {
  id: 'mars',
  name: 'Mars',
  terrainRadius: 700,
  curvatureRadius: 1450,
  elevationScale: 1.8,
  baseFrequency: 0.04,
  octaveCount: 6,
  octaves: generateOctaves(0.04, 6, 99.2),
  craters: {
    count: 25,
    minRadius: 4,
    maxRadius: 18,
    depth: 2.5,
    rim: 0.5,
  },
  lodLevels: [
    { loadDistance: 15, tileSize: 60, segments: 160 },
    { loadDistance: 40, tileSize: 120, segments: 128 },
    { loadDistance: 100, tileSize: 240, segments: 96 },
    { loadDistance: 250, tileSize: 480, segments: 64 },
    { loadDistance: 600, tileSize: 700, segments: 48 },
  ],
  surfaceTint: '#b06838',
  roughness: 0.9,
  metalness: 0.02,
  bumpScale: 0.25,
  texturePath: '/assets/planets/surface-textures/mars_rocky_terrain_2k.jpg',
  microDetail: {
    rockDensity: 15,
    rockMinScale: 0.08,
    rockMaxScale: 0.6,
    grainOpacity: 0.2,
    streakDensity: 8,
    crackDensity: 10,
  },
  falloffStart: 8,
  falloffEnd: 28,
}

/* ------------------------------------------------------------------ */
/* Registry                                                           */
/* ------------------------------------------------------------------ */

export const PLANET_TERRAIN_CONFIGS: Record<string, PlanetTerrainConfig> = {
  mercury: MERCURY_TERRAIN,
  venus: VENUS_TERRAIN,
  earth: EARTH_TERRAIN,
  mars: MARS_TERRAIN,
}

export function getTerrainConfig(bodyId: string): PlanetTerrainConfig | undefined {
  return PLANET_TERRAIN_CONFIGS[bodyId]
}
