import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FlickerLight, GasLayers, ParticleField, SkyDome, type GasLayerSpec } from './WorldEnvironment'

const BAND_STOPS = ['#cfe0ff', '#8fb2f2', '#4f7fd0', '#2b52a8', '#122a5e']

const LAYERS: GasLayerSpec[] = [
  { height: 13, opacity: 0.6, bands: 4, driftSpeed: 0.01 },
  { height: 4, opacity: 0.56, bands: 5, driftSpeed: 0.016 },
  { height: -6, opacity: 0.5, bands: 6, driftSpeed: 0.024 },
  { height: -16, opacity: 0.44, bands: 7, driftSpeed: 0.036 },
]

/**
 * Neptune: supersonic winds in the dark. Deep blue layers race past, bright
 * methane cirrus streaks flash by, and a Great Dark Spot prowls the distance.
 */
export default function NeptuneWorld() {
  const spotTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')!
    const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 60)
    gradient.addColorStop(0, 'rgba(10,20,54,0.95)')
    gradient.addColorStop(0.55, 'rgba(14,28,70,0.55)')
    gradient.addColorStop(1, 'rgba(16,32,80,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  useEffect(() => () => spotTexture.dispose(), [spotTexture])

  return (
    <>
      <ambientLight intensity={0.45} color="#bcd2ff" />
      <hemisphereLight args={['#8fb2f2', '#0c1836', 0.6]} />

      <SkyDome top="#7fb0f0" mid="#3f6cc9" bottom="#0e1c40" />

      <GasLayers stops={BAND_STOPS} layers={LAYERS} />

      {/* Great Dark Spot */}
      <sprite position={[85, -10, -140]} scale={[75, 46, 1]}>
        <spriteMaterial map={spotTexture} transparent opacity={0.65} depthWrite={false} fog={false} />
      </sprite>

      {/* Fast methane cirrus streaks — the fastest winds in the solar system */}
      <ParticleField
        count={600}
        color="#dfeaff"
        size={0.26}
        opacity={0.3}
        spread={[90, 30, 90]}
        spinSpeed={-0.055}
      />

      <FlickerLight color="#bfd4ff" rate={0.6} intensity={80} position={[0, -16, -42]} />
    </>
  )
}
