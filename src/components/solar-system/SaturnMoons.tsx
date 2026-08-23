import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { registerCollider, syncColliderWithObject, unregisterCollider } from './colliders'

// Saturn's major moons. Distances are compressed versus reality but preserve
// the real ordering (Enceladus innermost, Titan outermost of the three) and
// clear the main ring system; period ordering is real (Enceladus fastest).
// They orbit inside Saturn's tilted hierarchy, matching the equatorial plane
// of the rings, which is astronomically correct for regular satellites.
const MOONS = [
  { name: 'Enceladus', distance: 11.5, radius: 0.05, color: '#eef2f5', speed: 0.16, startAngle: 1.1 },
  { name: 'Rhea', distance: 14.5, radius: 0.09, color: '#c9ccd1', speed: 0.11, startAngle: 3.3 },
  { name: 'Titan', distance: 19, radius: 0.19, color: '#d8a54e', speed: 0.07, startAngle: 5.0 },
]

export function SaturnMoons() {
  const pivotRefs = useRef<Array<THREE.Group | null>>([])
  const meshRefs = useRef<Array<THREE.Mesh | null>>([])

  useEffect(() => {
    MOONS.forEach((moon) => registerCollider(`moon-saturn-${moon.name}`, moon.radius))
    return () => {
      MOONS.forEach((moon) => unregisterCollider(`moon-saturn-${moon.name}`))
    }
  }, [])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    MOONS.forEach((moon, index) => {
      const pivot = pivotRefs.current[index]
      if (pivot) pivot.rotation.y = moon.startAngle + moon.speed * elapsed
      const mesh = meshRefs.current[index]
      if (mesh) syncColliderWithObject(`moon-saturn-${moon.name}`, mesh)
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
          <mesh
            ref={(node) => {
              meshRefs.current[index] = node
            }}
            position={[moon.distance, 0, 0]}
          >
            <sphereGeometry args={[moon.radius, 24, 24]} />
            <meshStandardMaterial color={moon.color} roughness={1} metalness={0} />
          </mesh>
        </group>
      ))}
    </>
  )
}
