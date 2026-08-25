import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The four Galilean moons of Jupiter. Distances compressed to stay inside
// Jupiter's gravity well and clear of the asteroid belt (orbit 34-39.5).
// Jupiter sits at orbit 45, so moon distances must exceed 5.5 to avoid
// clipping through the belt on the sunward side.
const MOONS = [
  { name: 'Io', distance: 6.2, radius: 0.2, color: '#d9b96a', speed: 0.32, startAngle: 0.4 },
  { name: 'Europa', distance: 7.8, radius: 0.17, color: '#cfc0ae', speed: 0.22, startAngle: 2.4 },
  { name: 'Ganymede', distance: 9.6, radius: 0.23, color: '#98a1ab', speed: 0.14, startAngle: 4.2 },
  { name: 'Callisto', distance: 11.5, radius: 0.21, color: '#767a80', speed: 0.09, startAngle: 5.5 },
]

export function GalileanMoons() {
  const pivotRefs = useRef<Array<THREE.Group | null>>([])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    MOONS.forEach((moon, index) => {
      const pivot = pivotRefs.current[index]
      if (pivot) pivot.rotation.y = moon.startAngle + moon.speed * elapsed
    })
  })

  return (
    <>
      {MOONS.map((moon, index) => (
        <group
          key={moon.name}
          ref={(node) => {
            pivotRefs.current[index] = node
          }}
        >
          <mesh position={[moon.distance, 0, 0]}>
            <sphereGeometry args={[moon.radius, 24, 24]} />
            <meshStandardMaterial color={moon.color} roughness={1} metalness={0} />
          </mesh>
        </group>
      ))}
    </>
  )
}
