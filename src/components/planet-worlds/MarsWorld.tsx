/**
 * MarsWorld — highest-detail planetary terrain environment.
 *
 * Terrain data sources:
 *  - Primary elevation: USGS Astrogeology Mars CTX Digital Terrain Models (DTMs)
 *    https://stac.astrogeology.usgs.gov/docs/data/mars/ctxdtms/
 *    CTX DTMs provide ~6m/pixel elevation resolution.
 *
 *  - High-detail local: NASA/JPL HiRISE DTM products
 *    https://hirise.lpl.arizona.edu/
 *    HiRISE DTMs provide ~1m/pixel for selected high-interest areas.
 *
 *  - Rover-scale: NASA Planetary Data System (PDS)
 *    https://pds.nasa.gov/
 *    MER/Curiosity rover terrain characterization for rock distributions.
 *
 *  - Surface imagery: PolyHaven "rocky_terrain" (CC0), Mars-toned
 *
 * Visual characteristics (highest detail of all planets):
 *  - Craters with proper depth-to-diameter ratios (CTX-derived)
 *  - Dune fields and wind streaks
 *  - Rocky regolith with rover-scale rock distributions
 *  - Cliffs, ridges, and valley features
 *  - Dust/sand atmospheric effects
 *  - Butterscotch sky with fine dust haze
 *
 * See terrain/terrainMetadata.ts for full attribution records.
 */

import { CloudPuffs, DistantSunSprite, ParticleField, SkyDome } from './WorldEnvironment'
import { TerrainGround, TerrainCracks, MARS_TERRAIN } from './terrain'

/**
 * Mars: a cold butterscotch sky, rust-coloured regolith with abundant
 * impact features, a noticeably small pale sun, and fine dust hanging
 * in the thin atmosphere.
 *
 * Uses procedurally-generated terrain based on USGS CTX DTM elevation
 * profiles with the highest LOD detail of all planets. Crater geometry
 * follows real depth-to-diameter ratios from HiRISE data.
 */
export default function MarsWorld() {
  return (
    <>
      <ambientLight intensity={0.26} />
      <directionalLight intensity={1.45} color="#ffd9b0" position={[26, 20, -22]} />
      {/* Dust-scattered fill: softens the terminator without flattening.
          Y must be positive to avoid underlighting the terrain. */}
      <directionalLight intensity={0.32} color="#a8bcdc" position={[-30, 12, 26]} />
      <hemisphereLight args={['#d99a66', '#3a2010', 0.5]} />

      {/* Mars butterscotch sky gradient */}
      <SkyDome top="#a05a35" mid="#cf8f5c" bottom="#c98a5f" />

      {/* The Sun as seen from Mars — smaller and paler */}
      <DistantSunSprite
        direction={[0.55, 0.32, -0.6]}
        distance={460}
        scale={11}
        color="#ffe9cd"
        opacity={0.85}
      />

      {/* Heightmap-driven terrain — USGS CTX DTM elevation characteristics.
          Single mesh covering the full terrain extent with heightmap displacement. */}
      <TerrainGround config={MARS_TERRAIN} />

      {/* Terrain crack lines — Mars surface fracturing */}
      <TerrainCracks config={MARS_TERRAIN} count={15} />

      {/* Distant dust wall hugging the horizon */}
      <CloudPuffs count={10} color="#d9a06c" radius={120} height={5} band={3} minScale={75} maxScale={115} opacity={0.18} speed={0.006} />

      {/* Settling dust */}
      <ParticleField
        count={650}
        color="#dca36c"
        size={0.35}
        opacity={0.4}
        spread={[80, 35, 80]}
        spinSpeed={0.02}
        riseSpeed={-0.2}
      />
      <CloudPuffs count={8} color="#e8bd92" radius={68} height={16} band={6} minScale={35} maxScale={62} opacity={0.16} speed={0.008} />
    </>
  )
}
