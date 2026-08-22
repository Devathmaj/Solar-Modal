import { useHighQualityTexture } from './Planet'
import { PLANET_TEXTURES } from './textures'

const RADIUS = 6
const SPHERE_SEGMENTS = 64

export function Sun() {
  const map = useHighQualityTexture(PLANET_TEXTURES.sun)

  return (
    <group>
      <mesh>
        <sphereGeometry args={[RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <pointLight intensity={2} decay={0} color="#fff2dc" />
    </group>
  )
}
