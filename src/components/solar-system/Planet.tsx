import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetConfig } from './config'
import { registerCollider, syncColliderWithObject, unregisterCollider } from './colliders'
import { bodyIdForPlanetName } from '../../config/planetWorlds'
import { isInputLocked, requestEnter } from '../planet-worlds/worldState'
import { isTap } from '../planet-worlds/pointerGuard'

const SPHERE_SEGMENTS = 64
const ORBIT_LINE_SEGMENTS = 256
const ORBIT_LINE_COLOR = '#7d8fa8'
const ORBIT_LINE_OPACITY = 0.22

interface PlanetProps extends PlanetConfig {
  children?: ReactNode
}

function OrbitPath({ radius }: { radius: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(ORBIT_LINE_SEGMENTS * 3)
    for (let i = 0; i < ORBIT_LINE_SEGMENTS; i++) {
      const angle = (i / ORBIT_LINE_SEGMENTS) * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return bufferGeometry
  }, [radius])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        color={ORBIT_LINE_COLOR}
        transparent
        opacity={ORBIT_LINE_OPACITY}
        depthWrite={false}
      />
    </lineLoop>
  )
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

export function Planet({
  name,
  texture,
  radius,
  orbitRadius,
  revolutionSpeed,
  rotationSpeed,
  axialTilt = 0,
  initialAngle = 0,
  children,
}: PlanetProps) {
  const map = useHighQualityTexture(texture)
  const gl = useThree((state) => state.gl)
  const orbitRef = useRef<THREE.Group>(null!)
  const anchorRef = useRef<THREE.Group>(null!)
  const spinnerRef = useRef<THREE.Mesh>(null!)

  const startAngle = THREE.MathUtils.degToRad(initialAngle)
  const tiltAngle = THREE.MathUtils.degToRad(axialTilt)
  const bodyId = bodyIdForPlanetName(name)

  useEffect(() => {
    registerCollider(`planet-${name}`, radius)
    return () => unregisterCollider(`planet-${name}`)
  }, [name, radius])

  // Very subtle integrated highlight — no artificial outlines or labels.
  const setHighlight = (enabled: boolean) => {
    const material = spinnerRef.current?.material as THREE.MeshStandardMaterial | undefined
    if (!material) return
    if (enabled) {
      material.emissive.set('#ffffff')
      material.emissiveIntensity = 0.08
    } else {
      material.emissive.set('#000000')
      material.emissiveIntensity = 1
    }
  }

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    orbitRef.current.rotation.y = startAngle + revolutionSpeed * elapsed
    spinnerRef.current.rotation.y = rotationSpeed * elapsed
    syncColliderWithObject(`planet-${name}`, anchorRef.current)
  })

  return (
    <>
      <OrbitPath radius={orbitRadius} />
      <group ref={orbitRef}>
        <group ref={anchorRef} position={[orbitRadius, 0, 0]}>
          <group rotation={[0, 0, tiltAngle]}>
            <mesh
              ref={spinnerRef}
              onPointerOver={(event) => {
                event.stopPropagation()
                if (!bodyId || isInputLocked()) return
                setHighlight(true)
                gl.domElement.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                setHighlight(false)
                gl.domElement.style.cursor = ''
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!bodyId || isInputLocked()) return
                if (!isTap(event.nativeEvent.clientX, event.nativeEvent.clientY)) return
                setHighlight(false)
                gl.domElement.style.cursor = ''
                requestEnter(bodyId)
              }}
            >
              <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
              <meshStandardMaterial map={map} roughness={1} metalness={0} />
            </mesh>
            {children}
          </group>
        </group>
      </group>
    </>
  )
}
