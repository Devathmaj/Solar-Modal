import { useMemo } from 'react'
import * as THREE from 'three'
import { CloudPuffs, GasLayers, GasSkyDome, ParticleField, type GasLayerSpec } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

// Light→dark ramp for the full-surround gas sky…
const SKY_STOPS = ['#eeddb5', '#d6b87f', '#b3925a', '#8a6939', '#5e4520', '#3f2d14']
// …and its mirrored twin drives the seamless near-field cloud decks.
const BAND_STOPS = mirrorStops(SKY_STOPS)
// Must match the world fog so decks and sky meet with no seam.
const HORIZON = '#a5824e'

const LAYERS: GasLayerSpec[] = [
  { height: 13, opacity: 0.55, bands: 4, driftSpeed: 0.004 },
  { height: 5, opacity: 0.52, bands: 5, driftSpeed: 0.007 },
  { height: -3, opacity: 0.48, bands: 6, driftSpeed: 0.011 },
  { height: -13, opacity: 0.42, bands: 7, driftSpeed: 0.017 },
]

/**
 * Saturn: like Jupiter but gentler — muted pale-gold bands, calmer shear,
 * and far above, the faint dark band of the rings' shadow crossing the sky.
 * Still no surface anywhere: only deepening gas.
 */
export default function SaturnWorld() {
  const ringShadow = useMemo(() => {
    const geometry = new THREE.RingGeometry(58, 108, 72)
    geometry.rotateX(-Math.PI / 2)
    return geometry
  }, [])

  return (
    <>
      <ambientLight intensity={0.55} color="#eeddb5" />
      <hemisphereLight args={['#eed9ac', '#4a3418', 0.6]} />
      <directionalLight intensity={1.0} color="#ffe8c0" position={[38, 66, -30]} />

      <GasSkyDome stops={SKY_STOPS} turb={0.08} drift={0.035} horizonColor={HORIZON} horizonSoftness={0.22} />

      {/* Ring shadow hint — a subtle dark annulus high overhead */}
      <mesh geometry={ringShadow} position={[0, 46, 0]}>
        <meshBasicMaterial color="#1c130a" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <GasLayers stops={BAND_STOPS} layers={LAYERS} />

      {/* Soft mid-level decks for parallax */}
      <CloudPuffs count={10} color="#eeddb5" radius={46} height={8} band={5} minScale={20} maxScale={42} opacity={0.13} speed={0.01} />
      <CloudPuffs count={7} color="#96753f" radius={40} height={-6} band={4} minScale={24} maxScale={46} opacity={0.15} speed={-0.012} />

      {/* Calm golden haze */}
      <ParticleField
        count={420}
        color="#ecd9ae"
        size={0.28}
        opacity={0.24}
        spread={[80, 30, 80]}
        spinSpeed={-0.02}
      />
    </>
  )
}
