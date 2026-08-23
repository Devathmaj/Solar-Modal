import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FlickerLight, GasLayers, ParticleField, SkyDome, type GasLayerSpec } from './WorldEnvironment'

const BAND_STOPS = ['#e8cfa8', '#c89a62', '#a06a38', '#7a4820', '#4e2c12']

const LAYERS: GasLayerSpec[] = [
  { height: 14, opacity: 0.85, bands: 5, driftSpeed: 0.006 },
  { height: 6, opacity: 0.8, bands: 6, driftSpeed: 0.009 },
  { height: -2, opacity: 0.75, bands: 7, driftSpeed: 0.013 },
  { height: -10, opacity: 0.7, bands: 8, driftSpeed: 0.02 },
  { height: -20, opacity: 0.62, bands: 9, driftSpeed: 0.031 },
]

/**
 * Jupiter: there is no "inside" — only ever-deeper atmosphere. The camera
 * hangs between cloud decks that shear past at different speeds; below, the
 * bands darken toward the hidden interior. The Great Red Spot drifts in the
 * middle distance like a weather system of its own.
 */
export default function JupiterWorld() {
  const spotTexture = useMemo(() => {
    // Reuse the glow generator indirectly via canvas — soft oval storm.
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')!
    const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 60)
    gradient.addColorStop(0, 'rgba(196,80,46,0.9)')
    gradient.addColorStop(0.55, 'rgba(164,58,32,0.5)')
    gradient.addColorStop(1, 'rgba(140,48,26,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  useEffect(() => () => spotTexture.dispose(), [spotTexture])

  return (
    <>
      <ambientLight intensity={0.5} color="#e8c090" />
      <hemisphereLight args={['#e8c090', '#4a2810', 0.65]} />

      <SkyDome top="#caa06a" mid="#8a5a30" bottom="#38200f" />

      <GasLayers stops={BAND_STOPS} layers={LAYERS} />

      {/* Great Red Spot — a storm bigger than Earth, far off */}
      <sprite position={[-95, -8, -150]} scale={[85, 52, 1]}>
        <spriteMaterial map={spotTexture} transparent opacity={0.6} depthWrite={false} fog={false} />
      </sprite>

      {/* Violent wind shear between layers */}
      <ParticleField
        count={650}
        color="#e8cba0"
        size={0.3}
        opacity={0.3}
        spread={[90, 34, 90]}
        spinSpeed={-0.045}
      />

      {/* Deep-atmosphere lightning */}
      <FlickerLight color="#ffd9a0" rate={1.3} intensity={100} position={[0, -18, -45]} />
    </>
  )
}
