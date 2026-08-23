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
 * Procedural cloud-band texture used by gas-giant atmospheres and hazy skies.
 * A vertical colour gradient plus soft horizontal streaks reads as layered
 * gas from almost any angle while costing a single small canvas upload.
 */
export function createBandTexture(options: BandTextureOptions) {
  const width = options.width ?? 512
  const height = options.height ?? 512
  const { canvas, context } = makeCanvas(width, height)

  const gradient = context.createLinearGradient(0, 0, 0, height)
  const stops = options.stops
  stops.forEach((stop, index) => {
    gradient.addColorStop(index / (stops.length - 1), stop)
  })
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  const streaks = options.streaks ?? 42
  for (let i = 0; i < streaks; i++) {
    const y = Math.random() * height
    const thickness = 2 + Math.random() * 14
    const alpha = 0.04 + Math.random() * 0.09
    const light = Math.random() > 0.5
    context.fillStyle = light
      ? `rgba(255,255,255,${alpha})`
      : `rgba(20,10,5,${alpha * 0.9})`
    const baseline = y
    context.beginPath()
    context.moveTo(0, baseline)
    for (let x = 0; x <= width; x += 16) {
      const wobble =
        Math.sin((x / width) * Math.PI * (2 + Math.random() * 4)) * thickness * 0.6
      context.lineTo(x, baseline + wobble)
    }
    context.lineTo(width, baseline + thickness)
    for (let x = width; x >= 0; x -= 16) {
      const wobble =
        Math.sin((x / width) * Math.PI * (2 + Math.random() * 4)) * thickness * 0.6
      context.lineTo(x, baseline + thickness + wobble)
    }
    context.closePath()
    context.fill()
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
