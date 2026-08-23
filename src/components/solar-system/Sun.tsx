import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createRadialGlowTexture } from './glowTexture'
import { useHighQualityTexture } from './Planet'
import { PLANET_TEXTURES } from './textures'
import { registerCollider, unregisterCollider } from './colliders'
import { isInputLocked, requestEnter } from '../planet-worlds/worldState'
import { isTap } from '../planet-worlds/pointerGuard'
import {
  hideHoverLabel,
  moveHoverLabel,
  showHoverLabel,
} from '../planet-worlds/bodyHover'

const RADIUS = 6
const SPHERE_SEGMENTS = 64

export function Sun() {
  const map = useHighQualityTexture(PLANET_TEXTURES.sun)
  const gl = useThree((state) => state.gl)
  const meshRef = useRef<THREE.Mesh>(null!)
  const glow = useMemo(() => createRadialGlowTexture(), [])

  useEffect(() => {
    registerCollider('sun', RADIUS)
    return () => unregisterCollider('sun')
  }, [])

  useEffect(() => () => glow.dispose(), [glow])

  // Subtle brightness lift on hover — the Sun's material is unlit basic.
  const setHighlight = (enabled: boolean) => {
    const material = meshRef.current?.material as THREE.MeshBasicMaterial | undefined
    if (!material) return
    if (enabled) material.color.setRGB(1.16, 1.13, 1.06)
    else material.color.setRGB(1, 1, 1)
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={(event) => {
          event.stopPropagation()
          if (isInputLocked()) return
          setHighlight(true)
          gl.domElement.style.cursor = 'pointer'
          showHoverLabel('Visit Sun', event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (isInputLocked()) return
          moveHoverLabel(event.clientX, event.clientY)
        }}
        onPointerOut={() => {
          setHighlight(false)
          hideHoverLabel()
          gl.domElement.style.cursor = ''
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (isInputLocked()) return
          if (!isTap(event.nativeEvent.clientX, event.nativeEvent.clientY)) return
          setHighlight(false)
          hideHoverLabel()
          gl.domElement.style.cursor = ''
          requestEnter('sun', 'click')
        }}
      >
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
