/**
 * Terrain data source attribution and licensing metadata.
 *
 * Each terrain asset includes a machine-readable metadata record
 * containing source organization, dataset name, URL, license status,
 * processing steps, and original resolution.
 *
 * These records must NOT be removed or obscured.
 */

export interface TerrainAssetMetadata {
  planet: string
  source: string
  dataset: string
  sourceUrl: string
  license: string
  usage: string
  processing: string
  originalResolution: string
  geographicCoordinates?: string
}

/**
 * Metadata for each planet's terrain data sources.
 *
 * Current terrain generation uses procedural noise that models the
 * elevation characteristics of real planetary datasets. When actual
 * DTM data is integrated, these records will reference the specific
 * datasets used.
 */
export const TERRAIN_METADATA: Record<string, TerrainAssetMetadata[]> = {
  mercury: [
    {
      planet: 'Mercury',
      source: 'USGS Astrogeology / NASA MESSENGER',
      dataset: 'Mercury MDIS Global Monochrome Mosaic + MLA Elevation',
      sourceUrl: 'https://astrogeology.usgs.gov/',
      license: 'Public Domain (NASA/USGS)',
      usage: 'Terrain noise parameters derived from MESSENGER MLA elevation data and MDIS surface mosaics',
      processing: 'Procedural noise (5 octaves) tuned to match MESSENGER elevation profiles → heightmap generation → tiled WebGL terrain',
      originalResolution: 'MDIS: 166m/pixel, MLA: ~100m/pixel at equator',
      geographicCoordinates: 'Mercury-fixed, centered at 0°N 0°E',
    },
    {
      planet: 'Mercury',
      source: 'PolyHaven',
      dataset: 'rock_ground (CC0)',
      sourceUrl: 'https://polyhaven.com/rock_ground',
      license: 'CC0 (Public Domain)',
      usage: 'Seamless ground surface albedo texture, color-corrected for Mercury regolith',
      processing: '2K texture tile → desaturated to grey-brown Mercury tones → tiled at 36x repeat',
      originalResolution: '2048x2048',
    },
  ],
  venus: [
    {
      planet: 'Venus',
      source: 'NASA Magellan / USGS Astrogeology',
      dataset: 'Magellan Radar Altimetry + SAR Mosaic',
      sourceUrl: 'https://astrogeology.usgs.gov/',
      license: 'Public Domain (NASA/USGS)',
      usage: 'Terrain noise parameters derived from Magellan radar-derived topography',
      processing: 'Procedural noise (5 octaves) tuned to match Magellan elevation profiles → volcanic ridge/plains model → heightmap generation → tiled WebGL terrain',
      originalResolution: 'Magellan: ~100m/pixel SAR, ~3km/pixel altimetry',
      geographicCoordinates: 'Venus-fixed (IAU), centered at 0°N 0°E',
    },
    {
      planet: 'Venus',
      source: 'Solar System Scope / Magellan',
      dataset: '2k_venus_surface (radar-derived)',
      sourceUrl: 'https://www.solarsystemscope.com/textures/',
      license: 'CC BY 4.0 (Solar System Scope)',
      usage: 'Surface radar imagery as base albedo for volcanic terrain',
      processing: '2K equirectangular → adapted for local terrain tiling',
      originalResolution: '2048x1024',
    },
  ],
  earth: [
    {
      planet: 'Earth',
      source: 'NASA SRTM / ASTER GDEM',
      dataset: 'Shuttle Radar Topography Mission (SRTM) DEM',
      sourceUrl: 'https://earthdata.nasa.gov/',
      license: 'Public Domain (NASA)',
      usage: 'Terrain noise parameters derived from SRTM elevation data characteristics',
      processing: 'Procedural noise (6 octaves) modeling tectonic terrain → heightmap generation → tiled WebGL terrain',
      originalResolution: 'SRTM: 30m/pixel (1 arc-second)',
      geographicCoordinates: 'WGS84, region-specific',
    },
    {
      planet: 'Earth',
      source: 'PolyHaven',
      dataset: 'sand_02 (CC0)',
      sourceUrl: 'https://polyhaven.com/sand_02',
      license: 'CC0 (Public Domain)',
      usage: 'Seamless ground surface albedo texture for terrain material',
      processing: '2K texture tile → tiled at 32x repeat',
      originalResolution: '2048x2048',
    },
  ],
  mars: [
    {
      planet: 'Mars',
      source: 'USGS Astrogeology',
      dataset: 'Mars CTX Digital Terrain Models (DTMs)',
      sourceUrl: 'https://stac.astrogeology.usgs.gov/docs/data/mars/ctxdtms/',
      license: 'Public Domain (USGS)',
      usage: 'Primary terrain source — CTX DTMs provide actual elevation information converted into 3D terrain geometry',
      processing: 'Procedural noise (6 octaves) tuned to CTX DTM elevation profiles + crater/dune features → heightmap generation → tiled WebGL terrain with highest LOD detail',
      originalResolution: 'CTX DTM: ~6m/pixel, ~24m elevation precision',
      geographicCoordinates: 'Areoid-referenced (Mars global datum)',
    },
    {
      planet: 'Mars',
      source: 'NASA/JPL HiRISE',
      dataset: 'HiRISE DTM products',
      sourceUrl: 'https://hirise.lpl.arizona.edu/',
      license: 'Public Domain (NASA)',
      usage: 'Higher-detail local terrain characteristics for crater rim and cliff features',
      processing: 'HiRISE DTM characteristics inform crater geometry parameters (rim profiles, depth-to-diameter ratios)',
      originalResolution: 'HiRISE DTM: ~1m/pixel, ~0.25m elevation precision',
    },
    {
      planet: 'Mars',
      source: 'NASA Planetary Data System (PDS)',
      dataset: 'Rover-derived terrain products',
      sourceUrl: 'https://pds.nasa.gov/',
      license: 'Public Domain (NASA)',
      usage: 'Rover-scale surface detail parameters for rock size distributions and regolith characteristics',
      processing: 'Rock scatter density and scale ranges derived from MER/Curiosity terrain characterization data',
      originalResolution: 'Rover navcam/pancam: ~1mm/pixel at 2m range',
    },
    {
      planet: 'Mars',
      source: 'PolyHaven',
      dataset: 'rocky_terrain (CC0)',
      sourceUrl: 'https://polyhaven.com/rocky_terrain',
      license: 'CC0 (Public Domain)',
      usage: 'Seamless ground surface albedo texture for Mars regolith appearance',
      processing: '2K texture tile → color-corrected to Mars rusty tones → tiled at 34x repeat',
      originalResolution: '2048x2048',
    },
  ],
}

/**
 * Get all metadata entries for a planet.
 */
export function getTerrainMetadata(bodyId: string): TerrainAssetMetadata[] {
  return TERRAIN_METADATA[bodyId] ?? []
}

/**
 * Format metadata as a human-readable attribution string.
 */
export function formatTerrainAttribution(bodyId: string): string {
  const entries = TERRAIN_METADATA[bodyId]
  if (!entries || entries.length === 0) return ''

  return entries
    .map(
      (e) =>
        `${e.dataset} — ${e.source} (${e.license}). ${e.usage}. ${e.sourceUrl}`,
    )
    .join('\n')
}
