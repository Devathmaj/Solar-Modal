import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CloudPuffs, FlickerLight, GasSkyDome, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

// Light→dark ramp for the full-surround gas sky…
const SKY_STOPS = ['#dbe6ff', '#a8c2f7', '#6d95e5', '#426fc7', '#2b53a8', '#1c3a7d']
// …and its mirrored twin drives the seamless near-field gas wall.
const BAND_STOPS = mirrorStops(SKY_STOPS)
// Must match the world fog so wall and sky meet with no seam.
const HORIZON = '#5682d6'

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
      <directionalLight intensity={1.0} color="#cfe0ff" position={[40, 64, -32]} />

      <GasSkyDome stops={SKY_STOPS} turb={0.12} drift={0.07} horizonColor={HORIZON} horizonSoftness={0.26} />

      {/* Continuous gas wall clad in the real Voyager 2 Neptune map, enhanced
          with deeper azure contrast and fast-shearing cirrus sheen */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/real-maps/neptune_voyager2_cylindrical.jpg"
        opacity={0.97}
        detailOpacity={0.2}
        tint="#e9f1ff"
        hRepeat={2}
        driftSpeed={0.012}
        bumpScale={0.4}
        enhance={{ saturation: 1.45, contrast: 1.38, brightness: 1.05, bandStrength: 0.95, grain: 0.6 }}
      />

      {/* Bright methane cirrus racing inside the wall */}
      <CloudPuffs count={10} color="#dfeaff" radius={44} height={8} band={6} minScale={18} maxScale={40} opacity={0.14} speed={-0.02} />
      <CloudPuffs count={7} color="#20439a" radius={38} height={-8} band={5} minScale={22} maxScale={46} opacity={0.16} speed={0.03} />

      {/* Great Dark Spot */}
      <sprite position={[85, -10, -140]} scale={[75, 46, 1]}>
        <spriteMaterial map={spotTexture} transparent opacity={0.65} depthWrite={false} fog={false} />
      </sprite>

      {/* Fast methane cirrus streaks — the fastest winds in the solar system */}
      <ParticleField
        count={760}
        color="#dfeaff"
        size={0.26}
        opacity={0.32}
        spread={[90, 30, 90]}
        spinSpeed={-0.07}
      />

      <FlickerLight color="#bfd4ff" rate={0.6} intensity={80} position={[0, -16, -42]} />
    </>
  )
}
