import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

// Source: HYG v3.8 stellar database, github.com/astronexus/HYG-Database
//         (merge of the Hipparcos, Yale Bright Star and Gliese catalogs).
// Catalog fields used: right ascension, declination, apparent magnitude,
//         B-V color index, distance (pc). Galactic latitudes are derived from
//         equatorial coordinates via the standard IAU J2000 north galactic
//         pole transformation (alpha=192.85948deg, delta=27.12825deg).
// Filtering: apparent magnitude <= 7.5 anywhere, plus stars down to magnitude
//         8.5 within +/-10 deg of the galactic plane (the Milky Way band);
//         Sun excluded. Every rendered point is a real catalog star.
// Approximate number of rendered stars: 34,269.
// License: CC BY-SA 2.5 — https://creativecommons.org/licenses/by-sa/2.5/
// Depth: catalog parallax distances are mapped logarithmically onto display
//         shells (near stars closer, distant stars farther). Stars lacking a
//         distance measurement are placed conservatively on the outermost
//         shell; their radial placement is a visualization choice, not data.
// Landmarks: star_landmarks.json is a curated subset of 19 bright named stars
//         taken verbatim from the same HYG catalog (positions/magnitudes are
//         catalog values; names included for a future label phase).
const STAR_DATA_URL = '/assets/stars/hyg_bright_stars.json'
const LANDMARK_DATA_URL = '/assets/stars/star_landmarks.json'

const STAR_RADIUS_MIN = 340
const STAR_RADIUS_MAX = 1150
const DISTANCE_SCALE_LOG = Math.log10(3000)
const MAX_MAGNITUDE_SHADE = 0.45

const MAGNITUDE_BUCKETS = [
  { limit: 1.5, size: 3.6, opacity: 1.0 },
  { limit: 3.0, size: 2.5, opacity: 0.85 },
  { limit: 4.5, size: 1.75, opacity: 0.62 },
  { limit: 6.0, size: 1.3, opacity: 0.46 },
  { limit: Number.POSITIVE_INFINITY, size: 1.0, opacity: 0.32 },
]

const LANDMARK_SIZE = 5
const LANDMARK_OPACITY = 0.95

const COLOR_RAMP: Array<[number, string]> = [
  [-0.33, '#9bb0ff'],
  [0.0, '#f8f7ff'],
  [0.3, '#fff4e8'],
  [0.6, '#ffe9d2'],
  [1.0, '#ffd2a1'],
  [1.7, '#ffbf7f'],
]

type StarRow = [number, number, number, number, number, number]

interface LandmarkStar {
  name: string
  raDeg: number
  decDeg: number
  mag: number
  bv: number
  distPc: number
}

interface StarCatalogData {
  rows: StarRow[]
  landmarks: LandmarkStar[]
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

function scenePosition(raDeg: number, decDeg: number, distancePc: number, target: THREE.Vector3) {
  const depth =
    distancePc > 0 ? Math.min(Math.log10(Math.max(distancePc, 1)) / DISTANCE_SCALE_LOG, 1) : 1
  const radius = STAR_RADIUS_MIN + depth * (STAR_RADIUS_MAX - STAR_RADIUS_MIN)
  const raRad = THREE.MathUtils.degToRad(raDeg)
  const decRad = THREE.MathUtils.degToRad(decDeg)
  const cosDec = Math.cos(decRad)
  return target
    .set(Math.cos(raRad) * cosDec, Math.sin(decRad), Math.sin(raRad) * cosDec)
    .multiplyScalar(radius)
}

function buildBucketGeometries(rows: StarRow[]): BucketGeometry[] {
  const buckets = MAGNITUDE_BUCKETS.map(() => ({
    positions: [] as number[],
    colors: [] as number[],
  }))
  const position = new THREE.Vector3()
  const color = new THREE.Color()

  for (const [raDeg, decDeg, magnitude, bv, distancePc] of rows) {
    const bucketIndex = MAGNITUDE_BUCKETS.findIndex((bucket) => magnitude < bucket.limit)
    scenePosition(raDeg, decDeg, distancePc, position)

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

function buildLandmarkGeometry(landmarks: LandmarkStar[]): THREE.BufferGeometry | null {
  if (landmarks.length === 0) return null
  const positions: number[] = []
  const colors: number[] = []
  const position = new THREE.Vector3()
  const color = new THREE.Color()

  for (const star of landmarks) {
    scenePosition(star.raDeg, star.decDeg, star.distPc, position)
    const shade = 1 - Math.min(star.mag / 6, 1) * MAX_MAGNITUDE_SHADE
    colorFromBv(star.bv, color).multiplyScalar(shade)
    positions.push(position.x, position.y, position.z)
    colors.push(color.r, color.g, color.b)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
}

export function Starfield() {
  const [catalog, setCatalog] = useState<StarCatalogData | null>(null)
  const sprite = useMemo(() => createStarTexture(), [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(STAR_DATA_URL).then((response) => response.json()),
      fetch(LANDMARK_DATA_URL).then((response) => response.json()),
    ])
      .then(([starCatalog, landmarkCatalog]: [{ rows: StarRow[] }, { stars: LandmarkStar[] }]) => {
        if (!cancelled) setCatalog({ rows: starCatalog.rows, landmarks: landmarkCatalog.stars })
      })
      .catch(() => {
        if (!cancelled) setCatalog({ rows: [], landmarks: [] })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const bucketGeometries = useMemo(
    () => (catalog ? buildBucketGeometries(catalog.rows) : null),
    [catalog],
  )
  const landmarkGeometry = useMemo(
    () => (catalog ? buildLandmarkGeometry(catalog.landmarks) : null),
    [catalog],
  )

  useEffect(() => {
    return () => {
      bucketGeometries?.forEach(({ geometry }) => geometry.dispose())
      landmarkGeometry?.dispose()
    }
  }, [bucketGeometries, landmarkGeometry])

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
      {landmarkGeometry && (
        <points geometry={landmarkGeometry}>
          <pointsMaterial
            size={LANDMARK_SIZE}
            map={sprite}
            vertexColors
            transparent
            opacity={LANDMARK_OPACITY}
            sizeAttenuation={false}
            depthWrite={false}
          />
        </points>
      )}
    </>
  )
}
