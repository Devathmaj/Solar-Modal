import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CloudPuffs, FlickerLight, ParticleField, SkyDome } from './WorldEnvironment'
import { createBandTexture } from './worldAssets'

/**
 * Entering the Sun is not stepping onto a floor — the camera hangs inside a
 * stylized photosphere: roiling plasma below, sparks rising all around, heavy
 * orange light. Clearly a visualization of the solar environment.
 */
export default function SunWorld() {
  const plasmaRef = useRef<THREE.Mesh>(null!)
  const underPlasmaRef = useRef<THREE.Mesh>(null!)

  const plasmaTexture = useMemo(
    () =>
      createBandTexture({
        stops: ['#fff0b8', '#ffc451', '#ff8412', '#c23a00', '#5e0f00'],
        streaks: 90,
      }),
    [],
  )
  const underTexture = useMemo(
    () =>
      createBandTexture({
        stops: ['#ffd27a', '#ff9426', '#d84f00'],
        streaks: 60,
      }),
    [],
  )

  useEffect(
    () => () => {
      plasmaTexture.dispose()
      underTexture.dispose()
    },
    [plasmaTexture, underTexture],
  )

  useFrame((state, delta) => {
    plasmaTexture.offset.y += delta * 0.012
    underTexture.offset.y -= delta * 0.007
    if (plasmaRef.current) plasmaRef.current.rotation.y += delta * 0.01
    if (underPlasmaRef.current) underPlasmaRef.current.rotation.y -= delta * 0.006
    void state
  })

  return (
    <>
      <ambientLight intensity={1.15} color="#ffd9a0" />
      <pointLight intensity={180} decay={2} distance={260} color="#fff3c4" position={[0, 14, 0]} />

      <SkyDome top="#fff3c4" mid="#ffb347" bottom="#7a1600" />

      {/* Roiling photosphere far below */}
      <mesh ref={plasmaRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -34, 0]}>
        <planeGeometry args={[520, 520]} />
        <meshBasicMaterial map={plasmaTexture} toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={underPlasmaRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -44, 0]}>
        <planeGeometry args={[520, 520]} />
        <meshBasicMaterial map={underTexture} toneMapped={false} fog={false} />
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
