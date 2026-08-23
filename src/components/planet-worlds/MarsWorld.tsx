import { CloudPuffs, DistantSunSprite, ParticleField, RockyGround, SkyDome, type SurfaceStyle } from './WorldEnvironment'

const SURFACE: SurfaceStyle = {
  palette: ['#b06a43', '#8f4f30', '#c98a5c', '#7a3f26'],
  craters: 110,
  craterSize: [2, 9],
  blotches: 90,
  speckles: 2400,
  streaks: 60,
}

const BOULDERS = { count: 420, minScale: 0.06, maxScale: 0.5, color: '#a35c33' }

/**
 * Mars: a cold butterscotch sky, rust-coloured regolith, a noticeably small
 * pale sun, and fine dust hanging motionless in the thin air.
 */
export default function MarsWorld() {
  return (
    <>
      <ambientLight intensity={0.26} />
      <directionalLight intensity={1.45} color="#ffd9b0" position={[26, 20, -22]} />
      {/* Dust-scattered fill: softens the terminator without flattening */}
      <directionalLight intensity={0.32} color="#a8bcdc" position={[-30, -8, 26]} />
      <hemisphereLight args={['#d99a66', '#7a3f22', 0.5]} />

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
        style={SURFACE}
        repeat={50}
        displacement={1.0}
        curvatureRadius={1350}
        tintA="#e8c4a0"
        tintB="#7d4526"
        bumpScale={0.08}
        boulders={BOULDERS}
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
