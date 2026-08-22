import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const SPHERE_SEGMENTS = 64

interface PlanetProps {
  texture: string
  radius: number
  position: [number, number, number]
  axialTilt?: number
}

export function useHighQualityTexture(path: string) {
  const gl = useThree((state) => state.gl)
  const map = useTexture(path)
  map.colorSpace = THREE.SRGBColorSpace
  map.magFilter = THREE.LinearFilter
  map.minFilter = THREE.LinearMipmapLinearFilter
  map.generateMipmaps = true
  map.anisotropy = gl.capabilities.getMaxAnisotropy()
  map.wrapS = THREE.ClampToEdgeWrapping
  map.wrapT = THREE.ClampToEdgeWrapping
  map.needsUpdate = true
  return map
}

export function Planet({ texture, radius, position, axialTilt = 0 }: PlanetProps) {
  const map = useHighQualityTexture(texture)

  return (
    <group position={position} rotation={[0, 0, THREE.MathUtils.degToRad(axialTilt)]}>
      <mesh>
        <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}
