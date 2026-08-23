import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createRadialGlowTexture } from '../solar-system/glowTexture'
import {
  createBandTexture,
  createRockSurfaceTexture,
  createSurfaceTexture,
  rockySurfaceHeight,
  terrainNoise,
  type SurfaceStyle,
} from './worldAssets'

export type { SurfaceStyle }

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
    vec3 dir = normalize(vWorldPosition);
    vec3 color = mix(midColor, topColor, smoothstep(0.02, 0.55, dir.y));
    color = mix(color, bottomColor, smoothstep(-0.04, -0.62, dir.y));
    // Subtle large-scale mottling so the sky never reads as a flat gradient.
    float mottle =
      sin(dot(dir, vec3(6.7, 3.1, 8.3))) * 0.65 +
      sin(dot(dir, vec3(-4.2, 9.5, 2.6))) * 0.35;
    color *= 1.0 + mottle * 0.035;
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
/* Gas sky (Jupiter / Saturn / ice giants)                             */
/* ------------------------------------------------------------------ */

const GAS_SKY_FRAGMENT = /* glsl */ `
  uniform vec3 colors[6];
  uniform float uTurb;
  uniform float uTime;
  uniform float uSpan;
  uniform vec3 uHorizon;
  uniform float uHorizonSoft;
  varying vec3 vWorldPosition;
  void main() {
    vec3 dir = normalize(vWorldPosition);
    float az = atan(dir.z, dir.x);
    float lat = dir.y;
    // Turbulent latitude perturbation — bands wobble like real flow.
    float w = sin(az * 3.0 + lat * 11.0 + uTime) * 0.5
            + sin(az * 7.0 - lat * 19.0 + uTime * 1.7 + 1.7) * 0.3
            + sin(az * 13.0 + lat * 37.0 + uTime * 0.6 + 4.2) * 0.2;
    lat += w * uTurb;
    // Palette ramp from zenith (lightest) to nadir (deepest gas).
    float s = clamp(lat / uSpan * 0.5 + 0.5, 0.0, 1.0) * 5.0;
    vec3 col = mix(
      mix(
        mix(mix(mix(colors[0], colors[1], clamp(s, 0.0, 1.0)), colors[2], clamp(s - 1.0, 0.0, 1.0)), colors[3], clamp(s - 2.0, 0.0, 1.0)),
        colors[4], clamp(s - 3.0, 0.0, 1.0)
      ),
      colors[5], clamp(s - 4.0, 0.0, 1.0)
    );
    // Two octaves of directional mottling kill any flat-gradient feel.
    col *= 1.0 + sin(dot(dir, vec3(29.4, 16.8, 23.1))) * sin(dot(dir, vec3(-19.7, 26.3, 13.9))) * 0.045;
    col *= 1.0 + sin(dot(dir, vec3(57.0, -43.0, 49.0))) * 0.02;
    // Converge to the atmosphere/fog colour in a gaussian band around the
    // horizon so fogged cloud decks and the sky meet with NO seam.
    if (uHorizonSoft > 0.0) {
      float hz = exp(-pow(dir.y / uHorizonSoft, 2.0));
      col = mix(col, uHorizon, clamp(hz, 0.0, 1.0));
    }
    gl_FragColor = vec4(col, 1.0);
  }
`

interface GasSkyDomeProps {
  /** Light→dark palette, zenith to nadir (exactly 5–6 entries). */
  stops: string[]
  /** How strongly bands wobble. */
  turb?: number
  /** Flow speed of the band perturbation. */
  drift?: number
  /** Vertical extent of the palette across the sphere. */
  span?: number
  radius?: number
  /**
   * Colour the sky converges to at the horizon — pass the world's fog colour
   * so fogged cloud decks blend into the sky with zero seam.
   */
  horizonColor?: string
  /** Half-width of the horizon convergence band (0 disables). */
  horizonSoftness?: number
}

/**
 * Full-surround banded gas sky. Because the far field IS gas — not a gradient
 * backdrop — and because the horizon band converges to the fog colour, there
 * is no horizon seam where deck planes meet sky.
 */
export function GasSkyDome({
  stops,
  turb = 0.09,
  drift = 0.05,
  span = 1.15,
  radius = 600,
  horizonColor,
  horizonSoftness = 0,
}: GasSkyDomeProps) {
  const uniforms = useMemo(
    () => ({
      colors: { value: Array.from({ length: 6 }, () => new THREE.Color('#ffffff')) },
      uTurb: { value: turb },
      uTime: { value: 0 },
      uSpan: { value: span },
      uHorizon: { value: new THREE.Color(horizonColor ?? '#000000') },
      uHorizonSoft: { value: horizonSoftness },
    }),
    [],
  )

  useEffect(() => {
    stops.forEach((hex, index) => {
      if (index < 6) uniforms.colors.value[index].set(hex)
    })
    uniforms.uTurb.value = turb
    uniforms.uSpan.value = span
    if (horizonColor) uniforms.uHorizon.value.set(horizonColor)
    uniforms.uHorizonSoft.value = horizonSoftness
  }, [stops, uniforms, turb, span, horizonColor, horizonSoftness])

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime * drift
  })

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[radius, 48, 32]} />
      <shaderMaterial
        vertexShader={SKY_VERTEX}
        fragmentShader={GAS_SKY_FRAGMENT}
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
/* Rocky ground (Mercury / Mars / Earth style surfaces)                */
/* ------------------------------------------------------------------ */

export interface BoulderSpec {
  count: number
  minScale: number
  maxScale: number
  color: string
}

interface RockyGroundProps {
  /** Procedural surface description (palette, craters, streaks, grain…). */
  style: SurfaceStyle
  /** Terrain extent; the horizon falls away over `curvatureRadius`. */
  size?: number
  segments?: number
  /** Detail-texture tiling — the tile itself is seamless. */
  repeat?: number
  displacement?: number
  /**
   * Radius of the planet the terrain is a cap of. Smaller = visibly rounder
   * horizon (Mercury ~1050), larger = subtler curve (Earth ~1700).
   */
  curvatureRadius?: number
  /** Large-scale vertex tint drift that breaks up texture repetition. */
  tintA?: string
  tintB?: string
  bumpScale?: number
  boulders?: BoulderSpec
}

/**
 * Curved planetary terrain: a bent grid whose height combines two noise
 * octaves plus the spherical drop of standing on a real world. The surface
 * material is a seamless procedural canvas (colour + bump) with per-vertex
 * macro tinting, so nothing repeats recognisably in any direction.
 */
export function RockyGround({
  style,
  size = 700,
  segments = 176,
  repeat = 34,
  displacement = 0.9,
  curvatureRadius,
  tintA = '#ffffff',
  tintB = '#9a9a9a',
  bumpScale = 0.035,
  boulders,
}: RockyGroundProps) {
  const gl = useThree((state) => state.gl)

  const { geometry, material } = useMemo(() => {
    const planeGeometry = new THREE.PlaneGeometry(size, size, segments, segments)
    planeGeometry.rotateX(-Math.PI / 2)
    const positionAttribute = planeGeometry.attributes.position as THREE.BufferAttribute

    const colorA = new THREE.Color(tintA)
    const colorB = new THREE.Color(tintB)
    const colors = new Float32Array(positionAttribute.count * 3)
    const vertexColor = new THREE.Color()

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i)
      const z = positionAttribute.getZ(i)

      const distance = Math.hypot(x, z)
      // Keep the content-anchor area walkable.
      const falloff = THREE.MathUtils.smoothstep(distance, 4, 26)

      let height =
        (terrainNoise(x, z) +
          terrainNoise(x * 3.13 + 5, z * 3.07 + 9) * 0.22) *
        displacement *
        falloff

      // Planetary curvature: drop below the tangent plane like on a sphere.
      if (curvatureRadius && curvatureRadius > 0) {
        const r2 = x * x + z * z
        height -= curvatureRadius - Math.sqrt(Math.max(curvatureRadius * curvatureRadius - r2, 0))
      }

      positionAttribute.setY(i, height)

      // Macro tint drift (very low frequency) hides any sense of tiling.
      const drift =
        0.5 + 0.5 * Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017 + 4.1)
      vertexColor.copy(colorA).lerp(colorB, drift)
      colors[i * 3] = vertexColor.r
      colors[i * 3 + 1] = vertexColor.g
      colors[i * 3 + 2] = vertexColor.b
    }

    positionAttribute.needsUpdate = true
    planeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    planeGeometry.computeVertexNormals()

    const surfaceMap = createSurfaceTexture(style)
    surfaceMap.repeat.set(repeat, repeat)
    surfaceMap.anisotropy = gl.capabilities.getMaxAnisotropy()

    return {
      geometry: planeGeometry,
      material: new THREE.MeshStandardMaterial({
        map: surfaceMap,
        // Luminance of the surface canvas doubles as relief.
        bumpMap: surfaceMap,
        bumpScale,
        roughness: 1,
        metalness: 0,
        vertexColors: true,
      }),
    }
  }, [style, size, segments, repeat, displacement, curvatureRadius, tintA, tintB, bumpScale, gl])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      if (material.map) material.map.dispose()
    },
    [geometry, material],
  )

  return (
    <>
      <mesh geometry={geometry} material={material} />
      {boulders && (
        <Boulders spec={boulders} displacement={displacement} curvatureRadius={curvatureRadius} />
      )}
    </>
  )
}

/** Scattered boulders sharing the terrain's height function — parallax cues. */
function Boulders({
  spec,
  displacement,
  curvatureRadius,
}: {
  spec: BoulderSpec
  displacement: number
  curvatureRadius: number | undefined
}) {
  const { geometry, material, mesh } = useMemo(() => {
    // Low-seg sphere displaced per-vertex: smoother craggy silhouettes than a
    // faceted polyhedron, and fewer vertices (indexed grid).
    const rockGeometry = new THREE.SphereGeometry(1, 10, 7)
    const positions = rockGeometry.attributes.position as THREE.BufferAttribute
    const grounding = new Float32Array(positions.count * 3)
    for (let i = 0; i < positions.count; i++) {
      // Deterministic per-vertex jitter → irregular boulder forms.
      const jitter = 0.74 + ((i * 2654435761) % 1000) / 1000 * 0.5
      const y = positions.getY(i) * jitter * 0.72
      positions.setXYZ(
        i,
        positions.getX(i) * jitter,
        y,
        positions.getZ(i) * jitter,
      )
      // Baked grounding shade: darker toward the base, like contact shadow.
      const t = THREE.MathUtils.clamp((y + 0.9) / 1.8, 0, 1)
      const shade = 0.5 + 0.5 * t
      grounding[i * 3] = shade
      grounding[i * 3 + 1] = shade
      grounding[i * 3 + 2] = shade
    }
    positions.needsUpdate = true
    rockGeometry.setAttribute('color', new THREE.BufferAttribute(grounding, 3))
    rockGeometry.computeVertexNormals()

    // Shared neutral rock albedo/relief — per-instance colour adds hue.
    const rockTexture = createRockSurfaceTexture()
    const rockMaterial = new THREE.MeshStandardMaterial({
      map: rockTexture,
      bumpMap: rockTexture,
      bumpScale: 1.5,
      roughness: 1,
      metalness: 0,
      vertexColors: true,
    })

    const instanced = new THREE.InstancedMesh(rockGeometry, rockMaterial, spec.count)
    instanced.frustumCulled = false

    const dummy = new THREE.Object3D()
    const tint = new THREE.Color()
    for (let i = 0; i < spec.count; i++) {
      let x = 0
      let z = 0
      do {
        const angle = Math.random() * Math.PI * 2
        const radius = 8 + Math.random() * 300
        x = Math.cos(angle) * radius
        z = Math.sin(angle) * radius
      } while (Math.hypot(x, z) < 8)

      const scale = spec.minScale + Math.random() * (spec.maxScale - spec.minScale)
      dummy.position.set(
        x,
        rockySurfaceHeight(x, z, displacement, curvatureRadius) + scale * 0.25,
        z,
      )
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.scale.set(scale * (0.7 + Math.random() * 0.6), scale * (0.6 + Math.random() * 0.5), scale * (0.7 + Math.random() * 0.6))
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)

      // Per-boulder brightness/hue variation defeats uniform-poly look.
      tint.set(spec.color).multiplyScalar(0.72 + Math.random() * 0.55)
      instanced.setColorAt(i, tint)
    }
    instanced.instanceMatrix.needsUpdate = true
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true

    return { geometry: rockGeometry, material: rockMaterial, mesh: instanced }
  }, [spec, displacement, curvatureRadius])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      material.map?.dispose()
    },
    [geometry, material],
  )

  return <primitive object={mesh} />
}

/* ------------------------------------------------------------------ */
/* Gas layers (Jupiter / Saturn / ice-giant atmospheres)               */
/* ------------------------------------------------------------------ */

export interface GasLayerSpec {
  height: number
  opacity: number
  /**
   * Vertical texture cycles baked per tile (use `mirrorStops` palettes so
   * tiles are seamless). More cycles = denser banding.
   */
  bands: number
  driftSpeed: number
  /** Horizontal texture repeats — breaks up along-band uniformity. */
  hRepeat?: number
}

interface GasLayersProps {
  stops: string[]
  layers: GasLayerSpec[]
  planeSize?: number
  streaks?: number
}

/**
 * Stacked translucent cloud decks with turbulent banded textures. The decks
 * are lit (standard material + bump relief) so the directional light models
 * real depth into the texture instead of a flat painted wash. Nothing solid
 * exists below — just progressively deeper, darker gas.
 */
export function GasLayers({ stops, layers, planeSize = 340, streaks = 80 }: GasLayersProps) {
  const textures = useMemo(
    () =>
      layers.map((layer, index) => {
        const texture = createBandTexture({ stops, streaks })
        texture.repeat.set(layer.hRepeat ?? 3, layer.bands + index * 0.35)
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
          <meshStandardMaterial
            map={textures[index]}
            bumpMap={textures[index]}
            bumpScale={0.35}
            roughness={1}
            metalness={0}
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
