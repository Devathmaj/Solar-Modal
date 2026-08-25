import { CloudPuffs, DistantSunSprite, ParticleField, TextureGround, SkyDome } from './WorldEnvironment'

const BOULDERS = { count: 600, minScale: 0.08, maxScale: 0.6, color: '#a35c33' }

/**
 * Mars: a cold butterscotch sky, rust-coloured regolith with abundant
 * impact features, a noticeably small pale sun, and fine dust hanging
 * in the thin atmosphere. Uses real Mars surface texture on curved terrain.
 */
export default function MarsWorld() {
  return (
    <>
      <ambientLight intensity={0.26} />
      <directionalLight intensity={1.45} color="#ffd9b0" position={[26, 20, -22]} />
      {/* Dust-scattered fill: softens the terminator without flattening */}
      <directionalLight intensity={0.32} color="#a8bcdc" position={[-30, -8, 26]} />
      <hemisphereLight args={['#d99a66', '#7a3f22', 0.5]} />

      {/* Mars butterscotch sky gradient */}
      <SkyDome top="#a05a35" mid="#cf8f5c" bottom="#c98a5f" />

      {/* The Sun as seen from Mars — smaller and paler */}
      <DistantSunSprite
        direction={[0.55, 0.32, -0.6]}
        distance={460}
        scale={11}
        color="#ffe9cd"
        opacity={0.85}
      />

      {/* Real Mars surface texture on curved terrain */}
      <TextureGround
        texturePath="/assets/planets/mars/2k_mars.jpg"
        repeat={62}
        displacement={1.2}
        curvatureRadius={1450}
        tintA="#e8c4a0"
        tintB="#7d4526"
        bumpScale={0.15}
        carve={{ count: 30, minRadius: 6, maxRadius: 25, depth: 3, rim: 0.6 }}
        boulders={BOULDERS}
      />

      {/* Distant dust wall hugging the horizon */}
      <CloudPuffs count={10} color="#d9a06c" radius={120} height={5} band={3} minScale={75} maxScale={115} opacity={0.18} speed={0.006} />

      {/* Settling dust */}
      <ParticleField
        count={650}
        color="#dca36c"
        size={0.35}
        opacity={0.4}
        spread={[80, 35, 80]}
        spinSpeed={0.02}
        riseSpeed={-0.2}
      />
      <CloudPuffs count={8} color="#e8bd92" radius={68} height={16} band={6} minScale={35} maxScale={62} opacity={0.16} speed={0.008} />
    </>
  )
}