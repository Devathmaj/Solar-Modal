import { useMemo } from 'react'
import * as THREE from 'three'
import { GasLayers, ParticleField, SkyDome, type GasLayerSpec } from './WorldEnvironment'

const BAND_STOPS = ['#eeddb5', '#d9bc85', '#b8985e', '#8a6a3a', '#57401f']

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

      <SkyDome top="#e5d0a2" mid="#c2a06a" bottom="#503618" />

      {/* Ring shadow hint — a subtle dark annulus high overhead */}
      <mesh geometry={ringShadow} position={[0, 46, 0]}>
        <meshBasicMaterial color="#1c130a" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <GasLayers stops={BAND_STOPS} layers={LAYERS} />

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
