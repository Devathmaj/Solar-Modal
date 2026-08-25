/**
 * ProceduralDetail — micro-scale surface features that complement the
 * scientific terrain data.
 *
 * Adds small rocks, gravel scatter, sand/grain variation, cracks, and
 * dust/regolith detail that the source datasets don't capture at fine scales.
 *
 * These details:
 *  - Use InstancedMesh for GPU-instanced rendering (single draw call)
 *  - Are placed on the terrain surface using the heightmap height function
 *  - Complement rather than replace the scientific terrain
 *  - Do NOT invent large geological formations
 */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetTerrainConfig } from './terrainConfig'
import { sampleTerrainHeight, generateCraters } from './heightmapGenerator'
import { createRockSurfaceTexture } from '../worldAssets'

/* ------------------------------------------------------------------ */
/* Boulder/Rock scatter                                                */
/* ------------------------------------------------------------------ */

interface RockScatterProps {
  config: PlanetTerrainConfig
  count: number
  minScale: number
  maxScale: number
  color: string
  /** Maximum distance from camera to keep rocks visible. */
  visibilityRadius?: number
}

/**
 * InstancedMesh scatter of small rocks sitting on the terrain surface.
 * Each rock is a displaced sphere with vertex color variation, placed
 * at the correct terrain height via sampleTerrainHeight.
 */
export function RockScatter({
  config,
  count,
  minScale,
  maxScale,
  color,
  visibilityRadius = 120,
}: RockScatterProps) {
  const camera = useThree((state) => state.camera)
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const craters = useMemo(() => generateCraters(config), [config])

  const { geometry, material, positions } = useMemo(() => {
    // Create a craggy rock geometry
    const rockGeo = new THREE.SphereGeometry(1, 10, 8)
    const posAttr = rockGeo.attributes.position as THREE.BufferAttribute
    const grounding = new Float32Array(posAttr.count * 3)

    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i)
      const py = posAttr.getY(i)
      const pz = posAttr.getZ(i)

      // Deterministic jitter for craggy shapes
      const j1 = 0.7 + ((i * 2654435761) % 1000) / 1000 * 0.6
      const j2 = 0.85 + ((i * 1597463007) % 1000) / 1000 * 0.3
      const jitter = j1 * j2
      const flatten = 0.55 + ((i * 3266489917) % 1000) / 1000 * 0.35

      posAttr.setXYZ(i, px * jitter, py * jitter * flatten, pz * jitter)

      // Grounding color (darken bottom)
      const ny = posAttr.getY(i)
      const t = THREE.MathUtils.clamp((ny + 0.9) / 1.8, 0, 1)
      const shade = 0.35 + 0.65 * t
      grounding[i * 3] = shade
      grounding[i * 3 + 1] = shade
      grounding[i * 3 + 2] = shade
    }
    posAttr.needsUpdate = true
    rockGeo.setAttribute('color', new THREE.BufferAttribute(grounding, 3))
    rockGeo.computeVertexNormals()

    const rockTex = createRockSurfaceTexture()
    const rockMat = new THREE.MeshStandardMaterial({
      map: rockTex,
      bumpMap: rockTex,
      bumpScale: 1.5,
      roughness: 0.92,
      metalness: 0.03,
      vertexColors: true,
    })

    // Pre-generate positions
    const rockPositions: Array<{
      x: number
      y: number
      z: number
      scale: THREE.Vector3
      rotation: THREE.Euler
      tint: THREE.Color
    }> = []

    const tint = new THREE.Color()
    const baseColor = new THREE.Color(color)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 12 + Math.random() * 250
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = sampleTerrainHeight(x, z, config, craters)

      const scaleVal = minScale + Math.random() * (maxScale - minScale)
      const sx = scaleVal * (0.7 + Math.random() * 0.6)
      const sy = scaleVal * (0.6 + Math.random() * 0.5)
      const sz = scaleVal * (0.7 + Math.random() * 0.6)

      rockPositions.push({
        x,
        y: y + sy * 0.25,
        z,
        scale: new THREE.Vector3(sx, sy, sz),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
        tint: baseColor.clone().multiplyScalar(0.72 + Math.random() * 0.55),
      })
    }

    return { geometry: rockGeo, material: rockMat, positions: rockPositions }
  }, [config, count, minScale, maxScale, color, craters])

  // Update instance matrices when positions change
  useMemo(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current
    const dummy = new THREE.Object3D()

    positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.copy(p.rotation)
      dummy.scale.copy(p.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, p.tint)
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [positions])

  // Optional: hide rocks beyond visibility radius
  useFrame(() => {
    if (!meshRef.current) return
    const camPos = camera.position
    const mesh = meshRef.current

    const dummy = new THREE.Object3D()
    const zeroScale = new THREE.Vector3(0, 0, 0)
    let needsUpdate = false

    for (let i = 0; i < positions.length; i++) {
      const p = positions[i]
      const dist = Math.hypot(p.x - camPos.x, p.z - camPos.z)
      const visible = dist < visibilityRadius

      if (!visible) {
        mesh.getMatrixAt(i, dummy.matrix)
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
        if (dummy.scale.x > 0.001) {
          dummy.scale.copy(zeroScale)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
          needsUpdate = true
        }
      }
    }

    if (needsUpdate) {
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      material.map?.dispose()
    },
    [geometry, material],
  )

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Terrain grain overlay                                               */
/* ------------------------------------------------------------------ */

/**
 * A subtle semi-transparent ground plane with procedural grain noise
 * that adds sand/dust texture variation at close range.
 */
export function TerrainGrainOverlay({
  opacity = 0.12,
  size = 300,
  color = '#d4c4a0',
}: {
  opacity?: number
  size?: number
  color?: string
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Base fill
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 512, 512)

    // Grain speckle
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = 0.5 + Math.random() * 2
      const light = Math.random() > 0.5
      ctx.fillStyle = light
        ? `rgba(255,255,255,${0.03 + Math.random() * 0.06})`
        : `rgba(0,0,0,${0.04 + Math.random() * 0.08})`
      ctx.fillRect(x, y, size, size)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, 8)
    return tex
  }, [color])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} frustumCulled={false}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Crack lines (Mercury / Mars style)                                  */
/* ------------------------------------------------------------------ */

/**
 * Generates thin dark crack lines on the terrain surface using
 * line segments. These are purely visual overlays, not geometry.
 */
export function TerrainCracks({
  config,
  count = 10,
}: {
  config: PlanetTerrainConfig
  count?: number
}) {
  const craters = useMemo(() => generateCraters(config), [config])

  const geometry = useMemo(() => {
    const points: number[] = []

    for (let i = 0; i < count; i++) {
      // Start point
      let x = (Math.random() - 0.5) * 200
      let z = (Math.random() - 0.5) * 200
      let y = sampleTerrainHeight(x, z, config, craters)

      const segments = 6 + Math.floor(Math.random() * 10)
      const stepLen = 3 + Math.random() * 8
      const angle = Math.random() * Math.PI * 2

      points.push(x, y + 0.08, z)

      for (let j = 0; j < segments; j++) {
        const a = angle + (Math.random() - 0.5) * 0.8
        x += Math.cos(a) * stepLen
        z += Math.sin(a) * stepLen
        y = sampleTerrainHeight(x, z, config, craters)
        points.push(x, y + 0.08, z)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return geo
  }, [config, count, craters])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color="#2a2218"
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </lineSegments>
  )
}
