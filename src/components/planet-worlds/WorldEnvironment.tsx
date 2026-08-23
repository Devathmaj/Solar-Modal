import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createRadialGlowTexture } from '../solar-system/glowTexture'
import { useHighQualityTexture } from '../solar-system/Planet'
import { createBandTexture, terrainNoise } from './worldAssets'

/* ------------------------------------------------------------------ */
/* Sky                                                                 */
/* ------------------------------------------------------------------ */

const SKY_VERTEX = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 bottomColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y;
    vec3 color = mix(midColor, topColor, smoothstep(0.02, 0.55, h));
    color = mix(color, bottomColor, smoothstep(-0.04, -0.62, h));
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (dither - 0.5) * 0.012;
    gl_FragColor = vec4(color, 1.0);
  }
`

interface SkyDomeProps {
  top: string
  mid: string
  bottom: string
  radius?: number
}

/** Gradient atmosphere dome — the world's sky. Unlit, unaffected by fog. */
export function SkyDome({ top, mid, bottom, radius = 600 }: SkyDomeProps) {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color(top) },
      midColor: { value: new THREE.Color(mid) },
      bottomColor: { value: new THREE.Color(bottom) },
    }),
    [top, mid, bottom],
  )

  useEffect(() => {
    uniforms.topColor.value.set(top)
    uniforms.midColor.value.set(mid)
    uniforms.bottomColor.value.set(bottom)
  }, [uniforms, top, mid, bottom])

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[radius, 32, 20]} />
      <shaderMaterial
        vertexShader={SKY_VERTEX}
        fragmentShader={SKY_FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Stars (for thin/atmosphere-free skies)                              */
/* ------------------------------------------------------------------ */

export function StarPoints({
  count = 900,
  radius = 520,
  size = 1.8,
  opacity = 0.85,
  minElevation = -0.05,
}: {
  count?: number
  radius?: number
  size?: number
  opacity?: number
  minElevation?: number
}) {
  const glow = useMemo(() => createRadialGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const azimuth = Math.random() * Math.PI * 2
      const elevation =
        Math.asin(minElevation + Math.random() * (1 - minElevation))
      positions[i * 3] = Math.cos(elevation) * Math.cos(azimuth) * radius
      positions[i * 3 + 1] = Math.sin(elevation) * radius
      positions[i * 3 + 2] = Math.cos(elevation) * Math.sin(azimuth) * radius
    }
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return bufferGeometry
  }, [count, radius, minElevation])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry} renderOrder={-9}>
      <pointsMaterial
        map={glow}
        color="#dfe8ff"
        size={size}
        sizeAttenuation={false}
        transparent
        opacity={opacity}
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Particles (dust, wind streaks, plasma sparks)                       */
/* ------------------------------------------------------------------ */

interface ParticleFieldProps {
  count?: number
  color?: string
  /** Particle sprite size in world units (attenuated). */
  size?: number
  opacity?: number
  additive?: boolean
  spread?: [number, number, number]
  /** Slow rotation of the whole field (wind shear feel). */
  spinSpeed?: number
  /** Vertical drift speed with wrap-around (rising plasma / settling dust). */
  riseSpeed?: number
}

export function ParticleField({
  count = 500,
  color = '#ffffff',
  size = 0.35,
  opacity = 0.5,
  additive = false,
  spread = [50, 24, 50],
  spinSpeed = 0,
  riseSpeed = 0,
}: ParticleFieldProps) {
  const glow = useMemo(() => createRadialGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])

  const groupRef = useRef<THREE.Group>(null!)
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread[0]
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1]
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2]
    }
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return bufferGeometry
  }, [count, spread])

  useEffect(() => () => geometry.dispose(), [geometry])

  const riseRange = spread[1]

  useFrame((_, delta) => {
    if (spinSpeed !== 0 && groupRef.current) {
      groupRef.current.rotation.y += spinSpeed * delta
    }
    if (riseSpeed !== 0) {
      const attribute = geometry.attributes.position as THREE.BufferAttribute
      const array = attribute.array as Float32Array
      const half = riseRange / 2
      for (let i = 1; i < array.length; i += 3) {
        array[i] += riseSpeed * delta
        if (array[i] > half) array[i] -= riseRange
        else if (array[i] < -half) array[i] += riseRange
      }
      attribute.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          map={glow}
          color={color}
          size={size}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Cloud puffs (billboarded soft volumes)                              */
/* ------------------------------------------------------------------ */

interface CloudPuffsProps {
  count?: number
  color?: string
  /** Horizontal spread radius of the cloud field. */
  radius?: number
  /** Vertical band thickness around `height`. */
  band?: number
  height?: number
  minScale?: number
  maxScale?: number
  opacity?: number
  /** Slow orbital drift of the entire layer. */
  speed?: number
}

export function CloudPuffs({
  count = 16,
  color = '#ffffff',
  radius = 42,
  band = 6,
  height = 10,
  minScale = 14,
  maxScale = 34,
  opacity = 0.18,
  speed = 0.008,
}: CloudPuffsProps) {
  const glow = useMemo(() => createRadialGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])

  const groupRef = useRef<THREE.Group>(null!)

  const puffs = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2
        const distance = radius * (0.25 + Math.random() * 0.75)
        return {
          position: [
            Math.cos(angle) * distance,
            height + (Math.random() - 0.5) * band,
            Math.sin(angle) * distance,
          ] as [number, number, number],
          scale: minScale + Math.random() * (maxScale - minScale),
          opacity: opacity * (0.55 + Math.random() * 0.7),
        }
      }),
    [count, radius, band, height, minScale, maxScale, opacity],
  )

  useFrame((_, delta) => {
    if (speed !== 0 && groupRef.current) groupRef.current.rotation.y += speed * delta
  })

  return (
    <group ref={groupRef}>
      {puffs.map((puff, index) => (
        <sprite key={index} position={puff.position} scale={[puff.scale, puff.scale * 0.55, 1]}>
          <spriteMaterial
            map={glow}
            color={color}
            transparent
            opacity={puff.opacity}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Rocky ground (Mercury / Mars style surfaces)                        */
/* ------------------------------------------------------------------ */

interface RockyGroundProps {
  texturePath: string
  size?: number
  segments?: number
  repeat?: number
  displacement?: number
  color?: string
}

/**
 * Displaced plane reusing an existing planetary texture at tiling repeat.
 * Fog swallows the edges so no skylines need to match up.
 */
export function RockyGround({
  texturePath,
  size = 320,
  segments = 110,
  repeat = 26,
  displacement = 0.9,
  color = '#ffffff',
}: RockyGroundProps) {
  const gl = useThree((state) => state.gl)
  const sourceMap = useHighQualityTexture(texturePath)

  const { geometry, material } = useMemo(() => {
    const planeGeometry = new THREE.PlaneGeometry(size, size, segments, segments)
    planeGeometry.rotateX(-Math.PI / 2)
    const positionAttribute = planeGeometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i)
      const z = positionAttribute.getZ(i)
      const distance = Math.hypot(x, z)
      // Flatten the centre so the content anchor area stays walkable.
      const falloff = THREE.MathUtils.smoothstep(distance, 4, 26)
      positionAttribute.setY(i, terrainNoise(x, z) * displacement * falloff)
    }
    positionAttribute.needsUpdate = true
    planeGeometry.computeVertexNormals()

    const tiledMap = sourceMap.clone()
    tiledMap.wrapS = THREE.RepeatWrapping
    tiledMap.wrapT = THREE.RepeatWrapping
    tiledMap.repeat.set(repeat, repeat)
    tiledMap.anisotropy = gl.capabilities.getMaxAnisotropy()
    tiledMap.needsUpdate = true

    return {
      geometry: planeGeometry,
      material: new THREE.MeshStandardMaterial({ map: tiledMap, roughness: 1, metalness: 0, color }),
    }
  }, [sourceMap, size, segments, repeat, displacement, color, gl])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      const mapped = material.map
      if (mapped) mapped.dispose()
    },
    [geometry, material],
  )

  return <mesh geometry={geometry} material={material} />
}

/* ------------------------------------------------------------------ */
/* Gas layers (Jupiter / Saturn / ice-giant atmospheres)               */
/* ------------------------------------------------------------------ */

export interface GasLayerSpec {
  height: number
  opacity: number
  /** Texture repeats along flight direction — more repeats = denser bands. */
  bands: number
  driftSpeed: number
}

interface GasLayersProps {
  stops: string[]
  layers: GasLayerSpec[]
  planeSize?: number
  streaks?: number
}

/**
 * Stacked translucent cloud planes with procedural banded textures and
 * per-layer drift. Nothing solid exists below — just progressively deeper,
 * darker layers, so descending reads as entering thicker gas.
 */
export function GasLayers({ stops, layers, planeSize = 420, streaks = 46 }: GasLayersProps) {
  const textures = useMemo(
    () =>
      layers.map((layer, index) => {
        const texture = createBandTexture({ stops, streaks })
        texture.repeat.set(1, layer.bands + index * 0.35)
        return texture
      }),
    [stops, layers, streaks],
  )

  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures])

  useFrame((_, delta) => {
    layers.forEach((layer, index) => {
      const texture = textures[index]
      texture.offset.y -= layer.driftSpeed * delta
    })
  })

  return (
    <>
      {layers.map((layer, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[0, layer.height, 0]}>
          <planeGeometry args={[planeSize, planeSize]} />
          <meshBasicMaterial
            map={textures[index]}
            transparent
            opacity={layer.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Distant sun sprite (for outer-planet skies)                         */
/* ------------------------------------------------------------------ */

export function DistantSunSprite({
  direction = [0.5, 0.45, -0.6],
  distance = 480,
  scale = 34,
  color = '#fff4dd',
  opacity = 0.95,
}: {
  direction?: [number, number, number]
  distance?: number
  scale?: number
  color?: string
  opacity?: number
}) {
  const glow = useMemo(() => createRadialGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])

  const position = useMemo(() => {
    const dir = new THREE.Vector3(...direction).normalize().multiplyScalar(distance)
    return dir.toArray() as [number, number, number]
  }, [direction, distance])

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={glow}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        fog={false}
      />
    </sprite>
  )
}

/* ------------------------------------------------------------------ */
/* Occasional lightning flicker (deep gas worlds)                      */
/* ------------------------------------------------------------------ */

export function FlickerLight({
  color = '#ffd9a0',
  rate = 0.5,
  intensity = 60,
  position = [0, -8, -30],
}: {
  color?: string
  rate?: number
  intensity?: number
  position?: [number, number, number]
}) {
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame((_, delta) => {
    const light = lightRef.current
    if (!light) return
    if (Math.random() < delta * rate) {
      light.intensity = intensity * (0.4 + Math.random())
    } else {
      light.intensity *= Math.exp(-delta * 9)
    }
  })

  return <pointLight ref={lightRef} color={color} intensity={0} distance={220} decay={2} position={position} />
}
