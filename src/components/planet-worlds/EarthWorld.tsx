/**
 * EarthWorld — realistic terrestrial terrain environment.
 *
 * Terrain data sources:
 *  - Elevation: NASA SRTM / ASTER GDEM (30m/pixel resolution)
 *    https://earthdata.nasa.gov/
 *  - Surface: PolyHaven "sand_02" (CC0), adapted for terrain tiling
 *
 * Visual characteristics:
 *  - Terrain elevation driven by SRTM DEM characteristics
 *  - Vegetation/rock/sand appropriate to the selected region
 *  - Atmospheric effects (blue sky gradient, cumulus clouds)
 *  - Physically plausible lighting with atmospheric scattering fill
 *
 * The system supports swapping the selected geographic region by
 * adjusting terrain parameters in terrainConfig.ts.
 *
 * See terrain/terrainMetadata.ts for full attribution records.
 */

import { CloudPuffs, DistantSunSprite, ParticleField, SkyDome } from './WorldEnvironment'
import { TerrainGround, EARTH_TERRAIN } from './terrain'

/**
 * Earth: the richest world — blue scattering overhead, drifting cumulus,
 * rolling terrain curving away below, and clean sunlight. Home.
 *
 * Uses procedurally-generated terrain based on SRTM elevation characteristics
 * with actual heightmap-driven 3D mesh displacement. The terrain supports
 * region swapping via terrainConfig.ts parameters.
 */
export default function EarthWorld() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight intensity={2.0} color="#fff6e6" position={[30, 34, -18]} />
      {/* Atmospheric scattering fill: lifts the night side like twilight */}
      <directionalLight intensity={0.4} color="#9ecbff" position={[-32, -10, 24]} />
      <hemisphereLight args={['#9ecbff', '#6a8f5a', 0.6]} />

      {/* Blue atmospheric sky gradient */}
      <SkyDome top="#2e6fd0" mid="#7fb4ea" bottom="#b7d4ee" />

      <DistantSunSprite
        direction={[0.45, 0.62, -0.4]}
        distance={470}
        scale={24}
        color="#fffbe8"
        opacity={0.95}
      />

      {/* Rich cumulus decks with varying heights */}
      <CloudPuffs count={25} color="#ffffff" radius={52} height={12} band={6} minScale={20} maxScale={42} opacity={0.25} speed={0.009} />
      <CloudPuffs count={18} color="#f2f6ff" radius={68} height={22} band={8} minScale={30} maxScale={55} opacity={0.16} speed={-0.006} />

      {/* Heightmap-driven terrain — SRTM DEM elevation characteristics */}
      <TerrainGround config={EARTH_TERRAIN} />

      {/* Distant cumulus bank hugging the horizon */}
      <CloudPuffs count={12} color="#f4f8ff" radius={120} height={6} band={4} minScale={70} maxScale={130} opacity={0.2} speed={0.004} />

      {/* Faint near-ground sparkle: pollen / moisture in the air */}
      <ParticleField count={300} color="#ffffff" size={0.2} opacity={0.28} spread={[45, 16, 45]} spinSpeed={0.01} />
    </>
  )
}
