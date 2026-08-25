import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CloudPuffs, FlickerLight, GasWalls, ParticleField } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'

const BAND_STOPS = mirrorStops(['#e2c493', '#bd9058', '#916031', '#66401d', '#402712', '#2c1a0c'])


/**
 * Jupiter: there is no "inside" — only ever-deeper atmosphere. The camera
 * hangs between cloud decks that shear past at different speeds; below, the
 * bands darken toward the hidden interior. The Great Red Spot drifts in the
 * middle distance like a weather system of its own.
 * Uses real Jupiter texture for the sky dome background.
 */
export default function JupiterWorld() {
  const spotTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')!
    const gradient = context.createRadialGradient(128, 128, 16, 128, 128, 120)
    gradient.addColorStop(0, 'rgba(196,80,46,0.95)')
    gradient.addColorStop(0.4, 'rgba(164,58,32,0.7)')
    gradient.addColorStop(0.7, 'rgba(140,48,26,0.4)')
    gradient.addColorStop(1, 'rgba(100,30,18,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  useEffect(() => () => spotTexture.dispose(), [spotTexture])

  return (
    <>
      <ambientLight intensity={0.5} color="#e8c090" />
      <hemisphereLight args={['#e8c090', '#4a2810', 0.65]} />
      <directionalLight intensity={1.15} color="#ffd9a8" position={[42, 70, -34]} />

      {/* Continuous banded gas wall — raw Voyager 2 map, no tint for natural depth */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/real-maps/jupiter_voyager2_cylindrical.jpg"
        opacity={0.96}
        detailOpacity={0}
        hRepeat={2}
        driftSpeed={0.006}
        bumpScale={0.8}
        radius={60}
        height={500}
      />

      {/* Mid-level cloud decks for parallax inside the wall */}
      <CloudPuffs count={14} color="#e8cfa8" radius={32} height={8} band={5} minScale={14} maxScale={30} opacity={0.18} speed={0.012} />
      <CloudPuffs count={10} color="#7d4f27" radius={28} height={-6} band={4} minScale={16} maxScale={34} opacity={0.2} speed={-0.016} />

      {/* Great Red Spot */}
      <sprite position={[-48, -5, -55]} scale={[50, 32, 1]}>
        <spriteMaterial map={spotTexture} transparent opacity={0.65} depthWrite={false} fog={false} />
      </sprite>

      {/* Violent wind shear between layers */}
      <ParticleField
        count={720}
        color="#e8cba0"
        size={0.22}
        opacity={0.35}
        spread={[50, 24, 50]}
        spinSpeed={-0.045}
      />

      {/* Deep-atmosphere lightning */}
      <FlickerLight color="#ffd9a0" rate={1.3} intensity={105} position={[0, -18, -45]} />
    </>
  )
}