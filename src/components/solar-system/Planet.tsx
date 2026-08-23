import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetConfig } from './config'
import { registerCollider, syncColliderWithObject, unregisterCollider } from './colliders'
import { bodyIdForPlanetName } from '../../config/planetWorlds'
import { isInputLocked, requestEnter } from '../planet-worlds/worldState'
import { isTap } from '../planet-worlds/pointerGuard'
import {
  hideHoverLabel,
  moveHoverLabel,
  showHoverLabel,
} from '../planet-worlds/bodyHover'

const SPHERE_SEGMENTS = 64
const ORBIT_LINE_SEGMENTS = 256

interface PlanetProps extends PlanetConfig {
  children?: ReactNode
}

const ORBIT_VERTEX = /* glsl */ `
  varying float vAngle;
  void main() {
    vAngle = atan(position.z, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Orbit line that opens a gap around the planet's live angular position —
 * the ring pierces the body's centre, and without the gap its near arc
 * slashes across the planet disc from every viewing angle.
 */
const ORBIT_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPlanetAngle;
  uniform float uGap;
  varying float vAngle;
  void main() {
    float d = abs(mod(vAngle - uPlanetAngle + 3.14159265, 6.28318530) - 3.14159265);
    if (d < uGap) discard;
    gl_FragColor = vec4(uColor, uOpacity);
  }
`

function OrbitPath({
  radius,
  bodyRadius,
  getAngle,
}: {
  radius: number
  bodyRadius: number
  getAngle: () => number
}) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(ORBIT_LINE_SEGMENTS * 3)
    for (let i = 0; i < ORBIT_LINE_SEGMENTS; i++) {
      const angle = (i / ORBIT_LINE_SEGMENTS) * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return bufferGeometry
  }, [radius])

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#7d8fa8') },
      uOpacity: { value: 0.22 },
      uPlanetAngle: { value: 0 },
      // Angular half-width of the gap, sized from the body's own radius.
      uGap: { value: Math.asin(Math.min(0.95, (bodyRadius * 1.7) / radius)) + 0.02 },
    }),
    [bodyRadius, radius],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    uniforms.uPlanetAngle.value = getAngle()
  })

  return (
    <lineLoop geometry={geometry}>
      <shaderMaterial
        vertexShader={ORBIT_VERTEX}
        fragmentShader={ORBIT_FRAGMENT}
        uniforms={uniforms}
        transparent
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
      <OrbitPath
        radius={orbitRadius}
        bodyRadius={radius}
        getAngle={() => orbitRef.current?.rotation.y ?? 0}
      />
      <group ref={orbitRef}>
        <group ref={anchorRef} position={[orbitRadius, 0, 0]}>
          <group rotation={[0, 0, tiltAngle]}>
            {/* Interior shell: if the camera ever ends up inside the sphere
                it sees a dark wall instead of hollow backfaces */}
            <mesh>
              <sphereGeometry args={[radius * 0.96, 32, 24]} />
              <meshBasicMaterial color="#06070b" side={THREE.BackSide} />
            </mesh>
            <mesh
              ref={spinnerRef}
              onPointerOver={(event) => {
                event.stopPropagation()
                if (!bodyId || isInputLocked()) return
                setHighlight(true)
                gl.domElement.style.cursor = 'pointer'
                showHoverLabel(`Visit ${name}`, event.clientX, event.clientY)
              }}
              onPointerMove={(event) => {
                if (!bodyId || isInputLocked()) return
                moveHoverLabel(event.clientX, event.clientY)
              }}
              onPointerOut={() => {
                setHighlight(false)
                hideHoverLabel()
                gl.domElement.style.cursor = ''
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (!bodyId || isInputLocked()) return
                if (!isTap(event.nativeEvent.clientX, event.nativeEvent.clientY)) return
                setHighlight(false)
                hideHoverLabel()
                gl.domElement.style.cursor = ''
                requestEnter(bodyId, 'click')
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
