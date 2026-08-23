import { GasLayers, ParticleField, SkyDome, type GasLayerSpec } from './WorldEnvironment'

const BAND_STOPS = ['#dff4f4', '#aee0dd', '#7fc4c4', '#5aa0a4', '#39767e']

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

      <SkyDome top="#bfe9e8" mid="#8fd0d0" bottom="#39646c" />

      <GasLayers stops={BAND_STOPS} layers={LAYERS} />

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
