import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

// Star catalog: HYG v3.8 (github.com/astronexus/HYG-Database) — a merge of the
// Hipparcos, Yale Bright Star and Gliese catalogs. Every rendered point is a real star.
// Dataset filtered to: 5070 stars with apparent magnitude <= 6.0 (naked-eye limit; Sun excluded).
// Used under: CC BY-SA 2.5 — https://creativecommons.org/licenses/by-sa/2.5/
// Row format: [right ascension (deg), declination (deg), apparent magnitude, B-V color index].
const STAR_DATA_URL = '/assets/stars/hyg_bright_stars.json'

const STAR_RADIUS = 600
const MAX_MAGNITUDE_SHADE = 0.45

const MAGNITUDE_BUCKETS = [
  { limit: 1.5, size: 3.6, opacity: 1.0 },
  { limit: 3.0, size: 2.5, opacity: 0.85 },
  { limit: 4.5, size: 1.7, opacity: 0.6 },
  { limit: Number.POSITIVE_INFINITY, size: 1.15, opacity: 0.38 },
]

const COLOR_RAMP: Array<[number, string]> = [
  [-0.33, '#9bb0ff'],
  [0.0, '#f8f7ff'],
  [0.3, '#fff4e8'],
  [0.6, '#ffe9d2'],
  [1.0, '#ffd2a1'],
  [1.7, '#ffbf7f'],
]

type StarRow = [number, number, number, number]

interface StarCatalog {
  count: number
  rows: StarRow[]
}

function colorFromBv(bv: number, target: THREE.Color): THREE.Color {
  const first = COLOR_RAMP[0]
  const last = COLOR_RAMP[COLOR_RAMP.length - 1]
  if (bv <= first[0]) return target.set(first[1])
  if (bv >= last[0]) return target.set(last[1])
  for (let i = 0; i < COLOR_RAMP.length - 1; i++) {
    const [stopA, hexA] = COLOR_RAMP[i]
    const [stopB, hexB] = COLOR_RAMP[i + 1]
    if (bv >= stopA && bv <= stopB) {
      const t = (bv - stopA) / (stopB - stopA)
      return target.set(hexA).lerp(new THREE.Color(hexB), t)
    }
  }
  return target.set(last[1])
}

function createStarTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

interface BucketGeometry {
  geometry: THREE.BufferGeometry
  bucketIndex: number
}

function buildBucketGeometries(rows: StarRow[]): BucketGeometry[] {
  const buckets = MAGNITUDE_BUCKETS.map(() => ({
    positions: [] as number[],
    colors: [] as number[],
  }))
  const position = new THREE.Vector3()
  const color = new THREE.Color()

  for (const [raDeg, decDeg, magnitude, bv] of rows) {
    const bucketIndex = MAGNITUDE_BUCKETS.findIndex((bucket) => magnitude < bucket.limit)
    const raRad = THREE.MathUtils.degToRad(raDeg)
    const decRad = THREE.MathUtils.degToRad(decDeg)
    const cosDec = Math.cos(decRad)
    position.set(
      Math.cos(raRad) * cosDec,
      Math.sin(decRad),
      Math.sin(raRad) * cosDec,
    ).multiplyScalar(STAR_RADIUS)

    const shade = 1 - Math.min(magnitude / 6, 1) * MAX_MAGNITUDE_SHADE
    colorFromBv(bv, color).multiplyScalar(shade)

    const bucket = buckets[bucketIndex]
    bucket.positions.push(position.x, position.y, position.z)
    bucket.colors.push(color.r, color.g, color.b)
  }

  return buckets.flatMap((bucket, bucketIndex) => {
    if (bucket.positions.length === 0) return []
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(bucket.colors, 3))
    return [{ geometry, bucketIndex }]
  })
}

export function Starfield() {
  const [rows, setRows] = useState<StarRow[] | null>(null)
  const sprite = useMemo(() => createStarTexture(), [])

  useEffect(() => {
    let cancelled = false
    fetch(STAR_DATA_URL)
      .then((response) => response.json())
      .then((catalog: StarCatalog) => {
        if (!cancelled) setRows(catalog.rows)
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const bucketGeometries = useMemo(() => (rows ? buildBucketGeometries(rows) : null), [rows])

  useEffect(() => {
    return () => {
      bucketGeometries?.forEach(({ geometry }) => geometry.dispose())
    }
  }, [bucketGeometries])

  useEffect(() => () => sprite.dispose(), [sprite])

  return (
    <>
      {bucketGeometries?.map(({ geometry, bucketIndex }) => (
        <points key={bucketIndex} geometry={geometry}>
          <pointsMaterial
            size={MAGNITUDE_BUCKETS[bucketIndex].size}
            map={sprite}
            vertexColors
            transparent
            opacity={MAGNITUDE_BUCKETS[bucketIndex].opacity}
            sizeAttenuation={false}
            depthWrite={false}
          />
        </points>
      ))}
    </>
  )
}
