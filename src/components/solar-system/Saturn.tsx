import { useMemo } from 'react'
import * as THREE from 'three'
import { useHighQualityTexture } from './Planet'
import { PLANET_TEXTURES } from './textures'

const AXIAL_TILT = 26.73
const SPHERE_SEGMENTS = 64

interface SaturnProps {
  radius: number
  position: [number, number, number]
}

function createRingGeometry(innerRadius: number, outerRadius: number) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 1)
  const positionAttribute = geometry.attributes.position
  const uvAttribute = geometry.attributes.uv
  const vertex = new THREE.Vector3()
  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i)
    uvAttribute.setXY(
      i,
      (vertex.length() - innerRadius) / (outerRadius - innerRadius),
      uvAttribute.getY(i),
    )
  }
  uvAttribute.needsUpdate = true
  return geometry
}

export function Saturn({ radius, position }: SaturnProps) {
  const planetMap = useHighQualityTexture(PLANET_TEXTURES.saturn)
  const ringMap = useHighQualityTexture(PLANET_TEXTURES.saturnRings)

  const innerRadius = radius * 1.25
  const outerRadius = radius * 2.3
  const ringGeometry = useMemo(
    () => createRingGeometry(innerRadius, outerRadius),
    [innerRadius, outerRadius],
  )

  return (
    <group position={position} rotation={[0, 0, THREE.MathUtils.degToRad(AXIAL_TILT)]}>
      <mesh>
        <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshStandardMaterial map={planetMap} roughness={1} metalness={0} />
      </mesh>
      <mesh geometry={ringGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          map={ringMap}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
