import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CloudPuffs, FlickerLight, GasSkyDome, ParticleField } from './WorldEnvironment'
import { createBandTexture } from './worldAssets'

// Full-surround photosphere ramp — zenith glare down to deep convection.
const SKY_STOPS = ['#fff6d8', '#ffdf9a', '#ffae48', '#e87218', '#a83c08', '#5e1500']
// Matches the world fog so the glowing deck dissolves into the glow.
const HORIZON = '#e07820'

/**
 * Entering the Sun is not stepping onto a floor — the camera hangs inside a
 * stylized photosphere: a roiling granulation deck far below dissolving into
 * the surrounding solar glow, sparks rising all around. No hard edges exist:
 * the deck is fog-blended and the sky carries the same plasma palette.
 */
export default function SunWorld() {
  const plasmaRef = useRef<THREE.Mesh>(null!)

  const plasmaTexture = useMemo(
    () =>
      createBandTexture({
        stops: ['#fff0b8', '#ffc451', '#ff8412', '#c23a00', '#5e0f00'],
        streaks: 90,
      }),
    [],
  )

  useEffect(() => () => plasmaTexture.dispose(), [plasmaTexture])

  useFrame((_, delta) => {
    plasmaTexture.offset.y += delta * 0.012
    if (plasmaRef.current) plasmaRef.current.rotation.y += delta * 0.01
  })

  return (
    <>
      <ambientLight intensity={1.15} color="#ffd9a0" />
      <pointLight intensity={180} decay={2} distance={260} color="#fff3c4" position={[0, 14, 0]} />

      <GasSkyDome stops={SKY_STOPS} turb={0.16} drift={0.09} horizonColor={HORIZON} horizonSoftness={0.32} />

      {/* Roiling granulation deck — fog blends its edges into the glow */}
      <mesh ref={plasmaRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -38, 0]}>
        <planeGeometry args={[900, 900]} />
        <meshBasicMaterial map={plasmaTexture} toneMapped={false} />
      </mesh>

      {/* Rising plasma sparks */}
      <ParticleField
        count={750}
        color="#ffd27a"
        size={0.5}
        opacity={0.6}
        additive
        spread={[80, 44, 80]}
        riseSpeed={3.2}
      />
      <ParticleField
        count={300}
        color="#fff1c0"
        size={0.9}
        opacity={0.32}
        additive
        spread={[60, 36, 60]}
        riseSpeed={5}
      />

      <CloudPuffs count={10} color="#ffbe62" radius={55} height={4} band={10} minScale={22} maxScale={48} opacity={0.14} speed={0.006} />
      <FlickerLight color="#fff1b0" rate={3.5} intensity={130} position={[10, -6, -24]} />
    </>
  )
}
