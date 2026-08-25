/**
 * Planetary Terrain System
 *
 * A layered terrain architecture that transitions from global planetary
 * spheres to realistic, physically modeled ground environments.
 *
 * Architecture:
 *  1. terrainConfig    — Per-planet terrain parameters (noise, LOD, materials)
 *  2. heightmapGenerator — Procedural elevation generation from multi-octave noise
 *  3. TerrainGrid      — Quadtree-like tile manager with distance-based LOD
 *  4. TerrainTile      — Individual mesh tile with heightmap displacement
 *  5. ProceduralDetail — Micro-scale surface features (rocks, cracks, grain)
 *  6. terrainMetadata  — Source attribution and licensing records
 *
 * Planet-specific behavior:
 *  - Mercury: airless cratered terrain, sharp shadows, MESSENGER elevation
 *  - Venus: volcanic plains beneath cloud layer, Magellan radar topography
 *  - Earth: varied terrestrial terrain with vegetation, SRTM/ASTER DEM
 *  - Mars: highest-detail craters/dunes/cliffs, CTX DTMs + HiRISE + rover data
 */

export { TerrainGrid } from './TerrainGrid'
export { TerrainGround } from './TerrainGround'
export { TerrainTile } from './TerrainTile'
export { RockScatter, TerrainGrainOverlay, TerrainCracks } from './ProceduralDetail'
export {
  MERCURY_TERRAIN,
  VENUS_TERRAIN,
  EARTH_TERRAIN,
  MARS_TERRAIN,
  PLANET_TERRAIN_CONFIGS,
  getTerrainConfig,
} from './terrainConfig'
export type { PlanetTerrainConfig, TerrainLODLevel, CraterConfig, MicroDetailConfig } from './terrainConfig'
export {
  generateTileHeightmap,
  generateCraters,
  sampleTerrainHeight,
  heightmapToNormals,
} from './heightmapGenerator'
export {
  TERRAIN_METADATA,
  getTerrainMetadata,
  formatTerrainAttribution,
} from './terrainMetadata'
export type { TerrainAssetMetadata } from './terrainMetadata'
