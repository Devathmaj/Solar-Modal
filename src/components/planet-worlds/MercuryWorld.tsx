/**
 * MercuryWorld — airless, heavily cratered terrain environment.
 *
 * Terrain data sources:
 *  - Elevation: USGS Astrogeology / NASA MESSENGER MLA (Mercury Laser Altimeter)
 *    https://astrogeology.usgs.gov/
 *  - Surface: PolyHaven "rock_ground" (CC0), color-corrected for Mercury regolith
 *
 * Visual characteristics:
 *  - Extremely rocky, airless terrain with sharp shadows
 *  - Cratered terrain with physically modeled crater bowls and rims
 *  - Exposed rock/regolith with no atmospheric scattering
 *  - Strong elevation changes around craters (MESSENGER-derived profiles)
 *
 * See terrain/terrainMetadata.ts for full attribution records.
 */

import { DistantSunSprite, StarPoints, TextureSkyDome } from './WorldEnvironment'
import { TerrainGround, TerrainCracks, MERCURY_TERRAIN } from './terrain'

/**
 * Mercury: airless, heavily cratered world with extreme temperature differences.
 * No atmosphere means the sky is black, the sun is harsh, and every feature
 * is sharply defined by high-contrast lighting with sharp shadow definition.
 *
 * Uses procedurally-generated terrain based on MESSENGER MLA elevation profiles
 * with actual heightmap-driven 3D mesh displacement.
 */
export default function MercuryWorld() {
  return (
    <>
      {/* Harsh key light creating extreme contrast - no atmospheric fill */}
      <ambientLight intensity={0.1} />
      <directionalLight intensity={3.2} color="#fffaf0" position={[40, 30, -30]} />
      <directionalLight intensity={0.4} color="#7a8c7e" position={[-45, -15, 35]} />
      <hemisphereLight args={['#1a1a1a', '#0d0d0d', 0.3]} />

      {/* Starfield sky - real star texture on a sphere */}
      <TextureSkyDome texturePath="/assets/background/stars_only_2k.jpg" />
      <StarPoints count={1500} size={2.0} opacity={0.98} />

      <DistantSunSprite
        direction={[0.62, 0.4, -0.52]}
        distance={480}
        scale={17}
        color="#ffffff"
        opacity={1}
      />

      {/* Heightmap-driven terrain — MESSENGER-derived elevation characteristics */}
      <TerrainGround config={MERCURY_TERRAIN} />

      {/* Terrain crack lines — airless world fracturing */}
      <TerrainCracks config={MERCURY_TERRAIN} count={12} />
    </>
  )
}
