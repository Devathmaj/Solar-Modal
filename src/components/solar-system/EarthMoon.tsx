import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHighQualityTexture } from './Planet'
import { PLANET_TEXTURES } from './textures'

// Real size ratio: Moon radius is ~0.27x Earth's. Orbiting mesh is offset from
// its pivot, which also produces the correct tidally-locked rotation.
const ORBIT_RADIUS = 3.4
const MOON_RADIUS_RATIO = 0.27
const ORBIT_SPEED = 0.35

export function EarthMoon({ planetRadius }: { planetRadius: number }) {
  const map = useHighQualityTexture(PLANET_TEXTURES.moon)
  const pivotRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    pivotRef.current.rotation.y = ORBIT_SPEED * state.clock.elapsedTime
  })

  return (
    <group ref={pivotRef}>
      <mesh position={[ORBIT_RADIUS, 0, 0]}>
        <sphereGeometry args={[planetRadius * MOON_RADIUS_RATIO, 32, 32]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}
