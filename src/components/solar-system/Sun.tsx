import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { createRadialGlowTexture } from './glowTexture'
import { useHighQualityTexture } from './Planet'
import { PLANET_TEXTURES } from './textures'

const RADIUS = 6
const SPHERE_SEGMENTS = 64

export function Sun() {
  const map = useHighQualityTexture(PLANET_TEXTURES.sun)
  const glow = useMemo(() => createRadialGlowTexture(), [])

  useEffect(() => () => glow.dispose(), [glow])

  return (
    <group>
      <mesh>
        <sphereGeometry args={[RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffdfae"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite scale={[46, 46, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffe9c8"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <pointLight intensity={2} decay={0} color="#fff2dc" />
    </group>
  )
}
