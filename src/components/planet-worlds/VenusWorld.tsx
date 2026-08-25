import { CloudPuffs, GasWalls, ParticleField, TextureSkyDome } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'
import { PLANET_ENHANCE } from '../solar-system/textures'

// Mirrored twin drives the seamless near-field cloud wall.
const BAND_STOPS = mirrorStops(['#f6e2ae', '#e3bd7a', '#cf9a48', '#a8761f', '#7a5216', '#573a10'])


/**
 * Venus: buried under a dense, rotating cloak of sulfuric-acid clouds. The
 * camera immerses in the planet's real atmosphere map, with super-rotating
 * cloud bands, hazy wisps, and a surface completely hidden below.
 * Uses real Venus surface texture for the sky dome background.
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

      {/* Faint dark disc far below - the hidden surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -25, 0]}>
        <circleGeometry args={[140, 56]} />
        <meshBasicMaterial color="#5e4517" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </>
  )
}