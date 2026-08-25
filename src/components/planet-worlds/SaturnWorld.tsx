import { useMemo } from 'react'
import * as THREE from 'three'
import { CloudPuffs, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

const BAND_STOPS = mirrorStops(['#eeddb5', '#d6b87f', '#b3925a', '#8a6939', '#5e4520', '#3f2d14'])


/**
 * Saturn: like Jupiter but gentler — muted pale-gold bands, calmer shear,
 * and far above, the faint dark band of the rings' shadow crossing the sky.
 * Uses real Saturn texture for the sky dome background.
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

      {/* Ring shadow hint */}
      <mesh geometry={ringShadow} position={[0, 46, 0]}>
        <meshBasicMaterial color="#1c130a" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Continuous gas wall — tight cylinder for immersive atmosphere */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/real-maps/saturn_cassini_cylindrical.jpg"
        opacity={0.97}
        detailOpacity={0.30}
        tint="#fff3d9"
        hRepeat={2}
        driftSpeed={0.004}
        bumpScale={0.35}
        radius={60}
        height={500}
      />

      {/* Great White Spot — Saturn's periodic planet-circling storm outbreak */}
      <CloudPuffs count={5} color="#ffffff" radius={24} height={10} band={4} minScale={18} maxScale={32} opacity={0.35} speed={0.02} />

      {/* Soft mid-level decks for parallax inside the wall */}
      <CloudPuffs count={12} color="#eeddb5" radius={34} height={7} band={4} minScale={16} maxScale={30} opacity={0.16} speed={0.01} />
      <CloudPuffs count={9} color="#96753f" radius={30} height={-5} band={4} minScale={18} maxScale={34} opacity={0.18} speed={-0.012} />

      {/* Calm golden haze */}
      <ParticleField
        count={480}
        color="#ecd9ae"
        size={0.2}
        opacity={0.28}
        spread={[48, 22, 48]}
        spinSpeed={-0.02}
      />
    </>
  )
}