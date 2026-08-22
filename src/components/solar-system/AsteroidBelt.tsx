import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANET_CONFIGS } from './config'

const ASTEROID_COUNTS = [400, 400, 300]
const BELT_INNER_GAP = 3
const BELT_OUTER_GAP = 5.5
const BELT_VERTICAL_THICKNESS = 1.4
const ASTEROID_MIN_SCALE = 0.07
const ASTEROID_MAX_SCALE = 0.42
const KEPLER_CONSTANT = 5.9
const SPEED_JITTER = 0.15

const dummy = new THREE.Object3D()

function surfaceNoise(x: number, y: number, z: number, seed: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 94.673) * 43758.5453
  return value - Math.floor(value)
}

function createAsteroidGeometry(seed: number) {
  const geometry = new THREE.IcosahedronGeometry(1, 1)
  const positionAttribute = geometry.attributes.position
  const vertex = new THREE.Vector3()
  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i)
    const noise = surfaceNoise(vertex.x, vertex.y, vertex.z, seed)
    vertex.multiplyScalar(1 + (noise - 0.5) * 0.55)
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

function randomQuaternion(): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
  )
}

interface ClusterData {
  angles: Float32Array
  radii: Float32Array
  heights: Float32Array
  scales: Float32Array
  quaternions: Float32Array
  speeds: Float32Array
}

function createClusterData(count: number, inner: number, outer: number): ClusterData {
  const data: ClusterData = {
    angles: new Float32Array(count),
    radii: new Float32Array(count),
    heights: new Float32Array(count),
    scales: new Float32Array(count * 3),
    quaternions: new Float32Array(count * 4),
    speeds: new Float32Array(count),
  }
  for (let i = 0; i < count; i++) {
    const t = (Math.random() + Math.random()) / 2
    const radius = inner + t * (outer - inner)
    data.angles[i] = Math.random() * Math.PI * 2
    data.radii[i] = radius
    data.heights[i] = ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * BELT_VERTICAL_THICKNESS
    const scale = ASTEROID_MIN_SCALE + Math.pow(Math.random(), 2.2) * (ASTEROID_MAX_SCALE - ASTEROID_MIN_SCALE)
    for (let axis = 0; axis < 3; axis++) {
      data.scales[i * 3 + axis] = scale * (0.7 + Math.random() * 0.6)
    }
    randomQuaternion().toArray(data.quaternions, i * 4)
    data.speeds[i] =
      (KEPLER_CONSTANT / Math.pow(radius, 1.5)) * (1 - SPEED_JITTER + Math.random() * SPEED_JITTER * 2)
  }
  return data
}

interface AsteroidClusterProps {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  count: number
  inner: number
  outer: number
}

function AsteroidCluster({ geometry, material, count, inner, outer }: AsteroidClusterProps) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const data = useMemo(() => createClusterData(count, inner, outer), [count, inner, outer])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    const mesh = ref.current
    for (let i = 0; i < count; i++) {
      const angle = data.angles[i] + data.speeds[i] * elapsed
      dummy.position.set(
        data.radii[i] * Math.cos(angle),
        data.heights[i],
        -data.radii[i] * Math.sin(angle),
      )
      dummy.quaternion.fromArray(data.quaternions, i * 4)
      dummy.scale.fromArray(data.scales, i * 3)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />
  )
}

export function AsteroidBelt() {
  const marsOrbit = PLANET_CONFIGS.find((config) => config.name === 'Mars')!.orbitRadius
  const jupiterOrbit = PLANET_CONFIGS.find((config) => config.name === 'Jupiter')!.orbitRadius
  const innerRadius = marsOrbit + BELT_INNER_GAP
  const outerRadius = jupiterOrbit - BELT_OUTER_GAP

  const geometries = useMemo(() => [createAsteroidGeometry(1), createAsteroidGeometry(2), createAsteroidGeometry(3)], [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#918b7f',
        roughness: 1,
        metalness: 0,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose())
      material.dispose()
    }
  }, [geometries, material])

  return (
    <group>
      {geometries.map((geometry, index) => (
        <AsteroidCluster
          key={index}
          geometry={geometry}
          material={material}
          count={ASTEROID_COUNTS[index]}
          inner={innerRadius}
          outer={outerRadius}
        />
      ))}
    </group>
  )
}
