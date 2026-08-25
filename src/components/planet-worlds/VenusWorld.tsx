/**
 * VenusWorld — volcanic terrain beneath dense sulfuric-acid clouds.
 *
 * Terrain data sources:
 *  - Elevation: NASA Magellan radar altimetry / USGS Astrogeology
 *    https://astrogeology.usgs.gov/
 *  - Surface: Solar System Scope / Magellan SAR mosaic (CC BY 4.0)
 *
 * Visual characteristics:
 *  - Rocky, volcanic terrain from Magellan radar-derived topography
 *  - Volcanic plains, ridges, fractures, shield-volcano terrain
 *  - Dense sulfuric-acid cloud atmosphere obscuring the surface
 *  - Radar-derived surface appearance (NOT optical photography)
 *
 * The terrain is rendered below the cloud layer. As the camera descends
 * through the atmosphere, the volcanic surface becomes visible through
 * breaks in the cloud deck.
 *
 * See terrain/terrainMetadata.ts for full attribution records.
 */

import { CloudPuffs, GasWalls, ParticleField, TextureSkyDome } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'
import { PLANET_ENHANCE } from '../solar-system/textures'
import { TerrainGround, RockScatter, VENUS_TERRAIN } from './terrain'

// Mirrored twin drives the seamless near-field cloud wall.
const BAND_STOPS = mirrorStops(['#f6e2ae', '#e3bd7a', '#cf9a48', '#a8761f', '#7a5216', '#573a10'])

/**
 * Venus: buried under a dense, rotating cloak of sulfuric-acid clouds.
 * Below the cloud deck lies volcanic terrain derived from Magellan radar
 * altimetry — ridges, fractures, and shield volcanoes.
 *
 * The cloud layer is the immersive "sky" environment, while the terrain
 * system provides actual 3D volcanic surface geometry below.
 */
export default function VenusWorld() {
  const enhance = PLANET_ENHANCE.venus

  return (
    <>
      <ambientLight intensity={0.9} color="#ffd9a0" />
      <hemisphereLight args={['#ffd9a0', '#8a5a20', 0.85]} />

      {/* Real Venus surface texture as the sky dome background */}
      <TextureSkyDome texturePath="/assets/planets/venus/2k_venus_surface.jpg" tint="#e8c890" opacity={0.5} />

      {/* Continuous wall clad in the real Venus atmosphere map, enhanced with
          saturated bands, contrast, and grain for the super-rotating haze. */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/venus/2k_venus_atmosphere.jpg"
        opacity={0.97}
        detailOpacity={0.18}
        tint="#ffe5cc"
        hRepeat={2}
        driftSpeed={0.005}
        bumpScale={0.35}
        enhance={enhance}
      />

      {/* Upper-level hazy drift wisps for parallax inside the deck */}
      <CloudPuffs count={20} color="#f0d49a" radius={52} height={8} band={12} minScale={24} maxScale={58} opacity={0.22} speed={0.015} />
      <CloudPuffs count={16} color="#c08a3e" radius={44} height={-8} band={10} minScale={28} maxScale={52} opacity={0.24} speed={-0.01} />

      {/* Sulfuric-acid haze motes */}
      <ParticleField count={600} color="#eed9a8" size={0.38} opacity={0.38} spread={[70, 36, 70]} spinSpeed={0.02} />

      {/* Volcanic terrain below the cloud layer — Magellan radar-derived topography.
          The terrain sits below the camera's typical cloud-layer position, becoming
          visible when the camera descends through breaks in the cloud deck. */}
      <group position={[0, -30, 0]}>
        <TerrainGround config={VENUS_TERRAIN} />
        <RockScatter
          config={VENUS_TERRAIN}
          count={200}
          minScale={0.1}
          maxScale={0.8}
          color="#a88040"
        />
      </group>
    </>
  )
}
