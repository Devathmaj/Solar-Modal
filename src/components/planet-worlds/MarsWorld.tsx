import { CloudPuffs, DistantSunSprite, ParticleField, RockyGround, SkyDome } from './WorldEnvironment'

/**
 * Mars: a cold butterscotch sky, rust-coloured regolith, a noticeably small
 * pale sun, and fine dust hanging motionless in the thin air.
 */
export default function MarsWorld() {
  return (
    <>
      <ambientLight intensity={0.34} />
      <directionalLight intensity={1.15} color="#ffd9b0" position={[26, 20, -22]} />
      <hemisphereLight args={['#d99a66', '#7a3f22', 0.55]} />

      <SkyDome top="#a05a35" mid="#cf8f5c" bottom="#eac094" />

      {/* The Sun as seen from Mars — smaller and paler */}
      <DistantSunSprite
        direction={[0.55, 0.32, -0.6]}
        distance={460}
        scale={11}
        color="#ffe9cd"
        opacity={0.85}
      />

      <RockyGround
        texturePath="/assets/planets/mars/2k_mars.jpg"
        displacement={1.05}
        repeat={24}
        color="#dcab80"
      />

      {/* Settling dust — ever-present on Mars */}
      <ParticleField
        count={480}
        color="#dca36c"
        size={0.28}
        opacity={0.32}
        spread={[64, 26, 64]}
        spinSpeed={0.02}
        riseSpeed={-0.3}
      />
      <CloudPuffs count={6} color="#e8bd92" radius={52} height={12} band={4} minScale={24} maxScale={46} opacity={0.1} speed={0.006} />
    </>
  )
}
