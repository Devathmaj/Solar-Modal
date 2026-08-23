import { CloudPuffs, GasSkyDome, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

// Light→dark ramp for the surrounding sulfuric haze…
const SKY_STOPS = ['#f6e2ae', '#e3bd7a', '#cf9a48', '#a8761f', '#7a5216', '#573a10']
// …mirrored for the seamless near-field cloud wall.
const BAND_STOPS = mirrorStops(SKY_STOPS)
// Must match the world fog so wall and sky meet with no seam.
const HORIZON = '#cf9a48'

/**
 * Venus: buried under crushing sulfuric-acid clouds. The camera is immersed
 * in the planet's real cloud deck (Venus atmosphere map on a continuous
 * wall), with drifting haze wisps and a surface that is nothing but a rumour
 * far below.
 */
export default function VenusWorld() {
  return (
    <>
      <ambientLight intensity={0.95} color="#ffd9a0" />
      <hemisphereLight args={['#ffd9a0', '#8a5a20', 0.85]} />

      <GasSkyDome stops={SKY_STOPS} turb={0.07} drift={0.03} horizonColor={HORIZON} horizonSoftness={0.24} />

      {/* Continuous wall clad in the real Venus atmosphere map */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/venus/2k_venus_atmosphere.jpg"
        opacity={0.97}
        detailOpacity={0.16}
        tint="#ffedc4"
        hRepeat={2}
        driftSpeed={0.005}
        bumpScale={0.3}
        enhance={{ saturation: 1.45, contrast: 1.3, brightness: 1.04, bandStrength: 0.85, grain: 0.55 }}
      />

      {/* Drifting foreground wisps for parallax inside the deck */}
      <CloudPuffs count={12} color="#f0d49a" radius={40} height={5} band={7} minScale={18} maxScale={42} opacity={0.18} speed={0.011} />
      <CloudPuffs count={8} color="#c08a3e" radius={34} height={-6} band={6} minScale={22} maxScale={46} opacity={0.2} speed={-0.008} />

      {/* Sulfuric haze motes */}
      <ParticleField count={420} color="#eed9a8" size={0.32} opacity={0.3} spread={[56, 28, 56]} spinSpeed={0.012} />

      {/* Surface completely obscured — only a faint dark disc far below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -22, 0]}>
        <circleGeometry args={[120, 48]} />
        <meshBasicMaterial color="#6e4517" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </>
  )
}
