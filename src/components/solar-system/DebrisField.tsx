import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const dummy = new THREE.Object3D()

function surfaceNoise(x: number, y: number, z: number, seed: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 94.673) * 43758.5453
  return value - Math.floor(value)
}

export function createRockGeometry(seed: number, detail: 0 | 1) {
  const geometry = new THREE.IcosahedronGeometry(1, detail)
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

export interface DebrisFieldProps {
  innerRadius: number
  outerRadius: number
  instancesPerGroup: number[]
  verticalThickness: number
  minScale: number
  maxScale: number
  keplerConstant: number
  speedJitter: number
  color: string
  geometryDetail?: 0 | 1
}

interface ClusterData {
  angles: Float32Array
  radii: Float32Array
  heights: Float32Array
  scales: Float32Array
  quaternions: Float32Array
  speeds: Float32Array
}

function createClusterData(count: number, innerRadius: number, outerRadius: number, props: DebrisFieldProps): ClusterData {
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
    const radius = innerRadius + t * (outerRadius - innerRadius)
    data.angles[i] = Math.random() * Math.PI * 2
    data.radii[i] = radius
    data.heights[i] =
      ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * props.verticalThickness
    const scale = props.minScale + Math.pow(Math.random(), 2.2) * (props.maxScale - props.minScale)
    for (let axis = 0; axis < 3; axis++) {
      data.scales[i * 3 + axis] = scale * (0.7 + Math.random() * 0.6)
    }
    new THREE.Quaternion()
      .setFromEuler(
        new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ),
      )
      .toArray(data.quaternions, i * 4)
    data.speeds[i] =
      (props.keplerConstant / Math.pow(radius, 1.5)) *
      (1 - props.speedJitter + Math.random() * props.speedJitter * 2)
  }
  return data
}

function DebrisCluster({
  geometry,
  material,
  count,
  innerRadius,
  outerRadius,
  props,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  count: number
  innerRadius: number
  outerRadius: number
  props: DebrisFieldProps
}) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const data = useMemo(
    () => createClusterData(count, innerRadius, outerRadius, props),
    [count, innerRadius, outerRadius],
  )

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

  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />
}

export function DebrisField(props: DebrisFieldProps) {
  const geometries = useMemo(
    () =>
      props.instancesPerGroup.map((_, index) =>
        createRockGeometry(index + 1, props.geometryDetail ?? 1),
      ),
    [props.instancesPerGroup, props.geometryDetail],
  )
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: props.color, roughness: 1, metalness: 0 }),
    [props.color],
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
        <DebrisCluster
          key={index}
          geometry={geometry}
          material={material}
          count={props.instancesPerGroup[index]}
          innerRadius={props.innerRadius}
          outerRadius={props.outerRadius}
          props={props}
        />
      ))}
    </group>
  )
}
