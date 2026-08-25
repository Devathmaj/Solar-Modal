import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CloudPuffs, FlickerLight, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

const BAND_STOPS = mirrorStops(['#dbe6ff', '#a8c2f7', '#6d95e5', '#426fc7', '#2b53a8', '#1c3a7d'])


/**
 * Neptune: supersonic winds in the deep blue. Dark layers race past, bright
 * methane cirrus streaks flash by, and a Great Dark Spot prowls the distance.
 * Uses real Neptune texture for the sky dome background.
 */
export default function NeptuneWorld() {
  const spotTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')!
    const gradient = context.createRadialGradient(128, 128, 16, 128, 128, 120)
    gradient.addColorStop(0, 'rgba(10,20,54,0.95)')
    gradient.addColorStop(0.4, 'rgba(14,28,70,0.7)')
    gradient.addColorStop(0.7, 'rgba(16,32,80,0.4)')
    gradient.addColorStop(1, 'rgba(8,16,32,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  useEffect(() => () => spotTexture.dispose(), [spotTexture])

  return (
    <>
      <ambientLight intensity={0.45} color="#bcd2ff" />
      <hemisphereLight args={['#8fb2f2', '#0c1836', 0.6]} />
      <directionalLight intensity={1.0} color="#cfe0ff" position={[40, 64, -32]} />

      {/* Continuous gas wall — raw Voyager 2 map, no tint for natural depth */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/real-maps/neptune_voyager2_cylindrical.jpg"
        opacity={0.97}
        detailOpacity={0}
        hRepeat={2}
        driftSpeed={0.012}
        bumpScale={0.8}
        radius={60}
        height={500}
      />

      {/* Bright methane cirrus racing inside the wall */}
      <CloudPuffs count={12} color="#dfeaff" radius={32} height={7} band={5} minScale={14} maxScale={30} opacity={0.18} speed={-0.02} />
      <CloudPuffs count={9} color="#20439a" radius={28} height={-7} band={4} minScale={16} maxScale={34} opacity={0.2} speed={0.03} />

      {/* Great Dark Spot */}
      <sprite position={[45, -6, -50]} scale={[46, 30, 1]}>
        <spriteMaterial map={spotTexture} transparent opacity={0.7} depthWrite={false} fog={false} />
      </sprite>

      {/* Fast methane cirrus streaks */}
      <ParticleField
        count={820}
        color="#dfeaff"
        size={0.18}
        opacity={0.35}
        spread={[52, 22, 52]}
        spinSpeed={-0.07}
      />

      <FlickerLight color="#bfd4ff" rate={0.6} intensity={85} position={[0, -16, -42]} />
    </>
  )
}