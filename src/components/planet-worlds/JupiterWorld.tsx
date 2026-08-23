import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CloudPuffs, FlickerLight, GasSkyDome, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

// Light→dark ramp for the full-surround gas sky…
const SKY_STOPS = ['#e2c493', '#bd9058', '#916031', '#66401d', '#402712', '#2c1a0c']
// …and its mirrored twin drives the seamless near-field gas wall.
const BAND_STOPS = mirrorStops(SKY_STOPS)
// Must match the world fog so wall and sky meet with no seam.
const HORIZON = '#7d5028'

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
      {/* Key light so the cloud decks shade with real relief */}
      <directionalLight intensity={1.15} color="#ffd9a8" position={[42, 70, -34]} />

      <GasSkyDome stops={SKY_STOPS} turb={0.11} drift={0.05} horizonColor={HORIZON} horizonSoftness={0.24} />

      {/* Continuous banded gas wall clad in Cassini's real Jupiter map */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/real-maps/jupiter_voyager2_cylindrical.jpg"
        opacity={0.96}
        driftSpeed={0.006}
      />

      {/* Mid-level cloud decks for parallax inside the wall */}
      <CloudPuffs count={11} color="#e8cfa8" radius={44} height={9} band={6} minScale={18} maxScale={40} opacity={0.15} speed={0.012} />
      <CloudPuffs count={8} color="#7d4f27" radius={38} height={-7} band={5} minScale={22} maxScale={46} opacity={0.17} speed={-0.016} />

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
