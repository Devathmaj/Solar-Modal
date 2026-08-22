import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Planet, useHighQualityTexture } from './Planet'
import { PLANET_TEXTURES } from './textures'
import { SATURN_CONFIG } from './config'
import { SaturnMoons } from './SaturnMoons'

const RING_INNER_RATIO = 1.25
const RING_OUTER_RATIO = 2.3

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

export function Saturn() {
  const ringMap = useHighQualityTexture(PLANET_TEXTURES.saturnRings)

  const ringGeometry = useMemo(
    () =>
      createRingGeometry(
        SATURN_CONFIG.radius * RING_INNER_RATIO,
        SATURN_CONFIG.radius * RING_OUTER_RATIO,
      ),
    [],
  )

  useEffect(() => () => ringGeometry.dispose(), [ringGeometry])

  return (
    <Planet {...SATURN_CONFIG}>
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
      <SaturnMoons />
    </Planet>
  )
}
