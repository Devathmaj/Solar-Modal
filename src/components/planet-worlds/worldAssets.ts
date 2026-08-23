import * as THREE from 'three'

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, context: canvas.getContext('2d')! }
}

export interface BandTextureOptions {
  /** Gradient stops from layer "top" to "bottom" (CSS colours). */
  stops: string[]
  width?: number
  height?: number
  /** Number of translucent turbulence streaks overlaid on the gradient. */
  streaks?: number
}

/**
 * Mirrors a palette so the resulting gradient starts and ends on adjacent
 * tones — textures built from it tile seamlessly in both directions, which
 * lets gas layers repeat without visible seams while keeping full
 * light-to-dark band cycles baked into every tile.
 */
export function mirrorStops(stops: string[]) {
  return [...stops, ...stops.slice(0, -1).reverse()]
}

/**
 * Procedural cloud-band texture used by gas-giant atmospheres. Layered
 * construction: broad soft cloud masses, multi-frequency wobble streaks,
 * then fine grain — enough high-frequency detail that surfaces read as
 * turbulent gas rather than painted gradients.
 */
export function createBandTexture(options: BandTextureOptions) {
  const width = options.width ?? 1024
  const height = options.height ?? 1024
  const { canvas, context } = makeCanvas(width, height)

  const gradient = context.createLinearGradient(0, 0, 0, height)
  const stops = options.stops
  stops.forEach((stop, index) => {
    gradient.addColorStop(index / (stops.length - 1), stop)
  })
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  // Broad elongated cloud masses — horizontal variation so the field is
  // never uniform along a band.
  const massCount = 22
  for (let i = 0; i < massCount; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const length = 120 + Math.random() * 260
    const thickness = 14 + Math.random() * 34
    const angle = (Math.random() - 0.5) * 0.25
    const tone = Math.random() > 0.5 ? 'rgba(255,255,255,' : 'rgba(15,8,4,'
    const alpha = 0.05 + Math.random() * 0.09
    for (const offsetX of [-width, 0, width]) {
      context.save()
      context.translate(x + offsetX, y)
      context.rotate(angle)
      context.scale(length / thickness, 1)
      const blobGradient = context.createRadialGradient(0, 0, 0, 0, 0, thickness)
      blobGradient.addColorStop(0, `${tone}${alpha})`)
      blobGradient.addColorStop(1, `${tone}0)`)
      context.fillStyle = blobGradient
      context.beginPath()
      context.arc(0, 0, thickness, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  }

  // Turbulence streaks with two sine frequencies per streak.
  const streaks = options.streaks ?? 72
  for (let i = 0; i < streaks; i++) {
    const y = Math.random() * height
    const thickness = 2 + Math.random() * 13
    const alpha = 0.04 + Math.random() * 0.09
    const light = Math.random() > 0.5
    const f1 = 1 + Math.floor(Math.random() * 3)
    const f2 = 4 + Math.floor(Math.random() * 5)
    const p1 = Math.random() * Math.PI * 2
    const p2 = Math.random() * Math.PI * 2
    const amp = thickness * 0.7
    const wobble = (x: number) =>
      Math.sin((x / width) * Math.PI * f1 + p1) * amp +
      Math.sin((x / width) * Math.PI * f2 + p2) * amp * 0.35
    context.fillStyle = light
      ? `rgba(255,255,255,${alpha})`
      : `rgba(20,10,5,${alpha * 0.9})`
    context.beginPath()
    context.moveTo(0, y + wobble(0))
    for (let x = 0; x <= width; x += 12) context.lineTo(x, y + wobble(x))
    for (let x = width; x >= 0; x -= 12) context.lineTo(x, y + thickness + wobble(x))
    context.closePath()
    context.fill()
  }

  // Fine grain — kills the smooth-gradient "painted" feel up close.
  for (let i = 0; i < 2600; i++) {
    const size = 0.8 + Math.random() * 1.6
    const light = Math.random() > 0.5
    context.fillStyle = light
      ? `rgba(255,255,255,${0.02 + Math.random() * 0.05})`
      : `rgba(0,0,0,${0.02 + Math.random() * 0.06})`
    context.fillRect(Math.random() * width, Math.random() * height, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

/**
 * Neutral grey rocky albedo/relief map for boulders — hue arrives via
 * per-instance colour so one shared texture serves every world.
 */
export function createRockSurfaceTexture(resolution = 256) {
  const { canvas, context } = makeCanvas(resolution, resolution)
  const W = resolution
  const H = resolution

  context.fillStyle = '#9c9c9c'
  context.fillRect(0, 0, W, H)

  for (let i = 0; i < 26; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = 8 + Math.random() * 30
    const tone = Math.random() > 0.5 ? 255 : 40
    for (const offsetX of [-W, 0, W]) {
      for (const offsetY of [-H, 0, H]) {
        const g = context.createRadialGradient(x + offsetX, y + offsetY, r * 0.1, x + offsetX, y + offsetY, r)
        g.addColorStop(0, `rgba(${tone},${tone},${tone},${0.08 + Math.random() * 0.12})`)
        g.addColorStop(1, `rgba(${tone},${tone},${tone},0)`)
        context.fillStyle = g
        context.beginPath()
        context.arc(x + offsetX, y + offsetY, r, 0, Math.PI * 2)
        context.fill()
      }
    }
  }

  for (let i = 0; i < 900; i++) {
    const size = 0.7 + Math.random() * 1.8
    const light = Math.random() > 0.5
    context.fillStyle = light
      ? `rgba(255,255,255,${0.05 + Math.random() * 0.12})`
      : `rgba(0,0,0,${0.06 + Math.random() * 0.14})`
    context.fillRect(Math.random() * W, Math.random() * H, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

/** Deterministic pseudo-noise used for terrain displacement. */
export function terrainNoise(x: number, z: number) {
  return (
    Math.sin(x * 0.055) * Math.cos(z * 0.047) * 0.55 +
    Math.sin(x * 0.13 + 1.7) * Math.cos(z * 0.11 + 4.2) * 0.28 +
    Math.sin(x * 0.31 + 3.1) * Math.cos(z * 0.27 + 1.2) * 0.12
  )
}

/* ------------------------------------------------------------------ */
/* Procedural ground surfaces                                          */
/* ------------------------------------------------------------------ */

export interface SurfaceStyle {
  /** Base tones blended by noise (first entry is the dominant colour). */
  palette: string[]
  /** Impact-crater count (Mercury/Mars style). */
  craters?: number
  /** Crater radius range in px on a 1024px tile. */
  craterSize?: [number, number]
  /** Medium-scale tonal blotches. */
  blotches?: number
  /** Fine grain speckles. */
  speckles?: number
  /** Elongated wind streaks (dust worlds). */
  streaks?: number
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function rgba(hex: string, alpha: number, shadeFactor = 1) {
  const [r, g, b] = hexToRgb(hex)
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * shadeFactor)))
  return `rgba(${clamp(r)},${clamp(g)},${clamp(b)},${alpha})`
}

function drawWrapped(
  width: number,
  height: number,
  draw: (offsetX: number, offsetY: number) => void,
) {
  for (const offsetX of [-width, 0, width]) {
    for (const offsetY of [-height, 0, height]) {
      draw(offsetX, offsetY)
    }
  }
}

/**
 * A seamless-tileable ground surface painted in layers: broad tonal patches,
 * medium blotches, impact craters, wind streaks and fine speckle grain.
 * Everything is drawn with wrap-around duplication so high repeat counts
 * never show seams, and its luminance doubles as a bump map.
 */
export function createSurfaceTexture(style: SurfaceStyle, resolution = 1024) {
  const { canvas, context } = makeCanvas(resolution, resolution)
  const W = resolution
  const H = resolution
  const palette = style.palette

  context.fillStyle = palette[0]
  context.fillRect(0, 0, W, H)

  const softBlob = (x: number, y: number, radius: number, color: string, alpha: number) => {
    drawWrapped(W, H, (dx, dy) => {
      const gradient = context.createRadialGradient(x + dx, y + dy, radius * 0.1, x + dx, y + dy, radius)
      gradient.addColorStop(0, rgba(color, alpha))
      gradient.addColorStop(1, rgba(color, 0))
      context.fillStyle = gradient
      context.beginPath()
      context.arc(x + dx, y + dy, radius, 0, Math.PI * 2)
      context.fill()
    })
  }

  // Macro patches — large-scale colour provinces so tiling never reads.
  const macroCount = Math.max(6, palette.length * 14)
  for (let i = 0; i < macroCount; i++) {
    const color = palette[1 + (i % Math.max(1, palette.length - 1))] ?? palette[0]
    softBlob(
      Math.random() * W,
      Math.random() * H,
      70 + Math.random() * 160,
      color,
      0.16 + Math.random() * 0.22,
    )
  }

  // Medium blotches — weathering, mineral staining.
  const blotchCount = style.blotches ?? 70
  for (let i = 0; i < blotchCount; i++) {
    const base = palette[Math.floor(Math.random() * palette.length)]
    softBlob(
      Math.random() * W,
      Math.random() * H,
      10 + Math.random() * 36,
      base,
      (Math.random() > 0.5 ? 0.16 : 0.24) + Math.random() * 0.1,
    )
  }

  // Impact craters — dark floor, lit rim on the sunward side, shadow opposite.
  if (style.craters) {
    const [minR, maxR] = style.craterSize ?? [3, 13]
    for (let i = 0; i < style.craters; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const r = minR + Math.random() * (maxR - minR)
      const base = palette[Math.floor(Math.random() * palette.length)]
      drawWrapped(W, H, (dx, dy) => {
        // Floor
        context.fillStyle = rgba(base, 0.4, 0.55)
        context.beginPath()
        context.arc(x + dx, y + dy, r, 0, Math.PI * 2)
        context.fill()
        // Shadowed inner wall (upper-left light source assumption)
        context.strokeStyle = rgba(base, 0.42, 0.45)
        context.lineWidth = Math.max(1, r * 0.32)
        context.beginPath()
        context.arc(x + dx, y + dy, r * 0.82, Math.PI * 0.15, Math.PI * 1.15)
        context.stroke()
        // Sunlit rim
        context.strokeStyle = rgba(base, 0.38, 1.35)
        context.lineWidth = Math.max(1, r * 0.26)
        context.beginPath()
        context.arc(x + dx, y + dy, r * 0.9, Math.PI * 1.1, Math.PI * 2.1)
        context.stroke()
      })
    }
  }

  // Wind streaks — elongated soft ellipses aligned to one prevailing axis.
  if (style.streaks) {
    for (let i = 0; i < style.streaks; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const length = 30 + Math.random() * 90
      const thickness = 3 + Math.random() * 8
      const angle = -0.35 + Math.random() * 0.2
      const base = palette[Math.floor(Math.random() * palette.length)]
      const alpha = 0.08 + Math.random() * 0.12
      drawWrapped(W, H, (dx, dy) => {
        context.save()
        context.translate(x + dx, y + dy)
        context.rotate(angle)
        context.scale(length / thickness, 1)
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, thickness)
        gradient.addColorStop(0, rgba(base, alpha, Math.random() > 0.5 ? 1.25 : 0.7))
        gradient.addColorStop(1, rgba(base, 0))
        context.fillStyle = gradient
        context.beginPath()
        context.arc(0, 0, thickness, 0, Math.PI * 2)
        context.fill()
        context.restore()
      })
    }
  }

  // Fine speckle grain — breaks up smooth gradients up close.
  const speckleCount = style.speckles ?? 1800
  for (let i = 0; i < speckleCount; i++) {
    const size = 0.8 + Math.random() * 1.8
    const light = Math.random() > 0.5
    context.fillStyle = light
      ? `rgba(255,255,255,${0.04 + Math.random() * 0.09})`
      : `rgba(0,0,0,${0.05 + Math.random() * 0.12})`
    context.fillRect(Math.random() * W, Math.random() * H, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

/* ------------------------------------------------------------------ */
/* Terrain height (shared by ground mesh and scattered rocks)          */
/* ------------------------------------------------------------------ */

/**
 * Height of the terrain at a world-space (x, z), including the fine noise
 * octave and the planetary-curvature drop. Rocks use this to sit exactly on
 * the ground mesh.
 */
export function rockySurfaceHeight(
  x: number,
  z: number,
  displacement: number,
  curvatureRadius: number | undefined,
) {
  const distance = Math.hypot(x, z)
  const falloff = THREE.MathUtils.smoothstep(distance, 4, 26)
  let height =
    (terrainNoise(x, z) + terrainNoise(x * 3.13 + 5, z * 3.07 + 9) * 0.22) * displacement * falloff
  if (curvatureRadius && curvatureRadius > 0) {
    const r2 = x * x + z * z
    height -= curvatureRadius - Math.sqrt(Math.max(curvatureRadius * curvatureRadius - r2, 0))
  }
  return height
}
