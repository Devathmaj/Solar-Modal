import { CloudPuffs, GasSkyDome, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

// Light→dark ramp for the full-surround gas sky…
const SKY_STOPS = ['#eaf7f6', '#c6e8e5', '#9ad4d2', '#6cb4b6', '#489095', '#2c656c']
// …and its mirrored twin drives the seamless near-field gas wall.
const BAND_STOPS = mirrorStops(SKY_STOPS)
// Must match the world fog so wall and sky meet with no seam.
const HORIZON = '#83c4c4'

/**
 * Uranus: an almost featureless teal-cyan calm. Feature-poor on purpose —
 * the serenity *is* the identity of this world.
 */
export default function UranusWorld() {
  return (
    <>
      <ambientLight intensity={0.65} color="#d8f2f0" />
      <hemisphereLight args={['#dff4f4', '#2e5a62', 0.6]} />
      <directionalLight intensity={0.9} color="#e8fbf9" position={[36, 62, -30]} />

      <GasSkyDome stops={SKY_STOPS} turb={0.05} drift={0.02} horizonColor={HORIZON} horizonSoftness={0.2} />

      {/* Continuous gas wall clad in the real Voyager 2 Uranus map — heavily
          enhanced so the calm world still reads as textured gas */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/real-maps/uranus_voyager2_cylindrical.png"
        opacity={0.97}
        detailOpacity={0.2}
        tint="#ecfffb"
        hRepeat={2}
        driftSpeed={0.003}
        bumpScale={0.46}
        enhance={{ saturation: 1.7, contrast: 1.6, brightness: 1.04, bandStrength: 1.35, grain: 0.75 }}
      />

      {/* Sparse bright methane-ice wisps — the only features Uranus shows */}
      <CloudPuffs count={7} color="#ffffff" radius={34} height={10} band={8} minScale={8} maxScale={20} opacity={0.12} speed={0.01} />

      {/* Faint methane deck drifting inside the wall */}
      <CloudPuffs count={8} color="#e4f7f5" radius={42} height={6} band={5} minScale={20} maxScale={44} opacity={0.1} speed={0.007} />
      <CloudPuffs count={6} color="#3f868c" radius={36} height={-7} band={4} minScale={22} maxScale={44} opacity={0.12} speed={-0.009} />

      {/* Sparse, slow methane haze */}
      <ParticleField
        count={260}
        color="#dff6f4"
        size={0.24}
        opacity={0.18}
        spread={[70, 30, 70]}
        spinSpeed={0.008}
      />
    </>
  )
}
