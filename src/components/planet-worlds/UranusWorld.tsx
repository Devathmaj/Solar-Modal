import { CloudPuffs, GasLayers, GasSkyDome, ParticleField, type GasLayerSpec } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

// Light→dark ramp for the full-surround gas sky…
const SKY_STOPS = ['#eaf7f6', '#c6e8e5', '#9ad4d2', '#6cb4b6', '#489095', '#2c656c']
// …and its mirrored twin drives the seamless near-field cloud decks.
const BAND_STOPS = mirrorStops(SKY_STOPS)
// Must match the world fog so decks and sky meet with no seam.
const HORIZON = '#83c4c4'

const LAYERS: GasLayerSpec[] = [
  { height: 12, opacity: 0.45, bands: 3, driftSpeed: 0.004 },
  { height: 2, opacity: 0.42, bands: 4, driftSpeed: 0.006 },
  { height: -9, opacity: 0.38, bands: 5, driftSpeed: 0.009 },
]

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

      <GasLayers stops={BAND_STOPS} layers={LAYERS} />

      {/* Faint methane deck drifting between the layers */}
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
