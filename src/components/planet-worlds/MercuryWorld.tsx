import { DistantSunSprite, RockyGround, SkyDome, StarPoints, type SurfaceStyle } from './WorldEnvironment'

const SURFACE: SurfaceStyle = {
  palette: ['#8f8880', '#7a736c', '#a39a90', '#6b645e'],
  craters: 240,
  craterSize: [2.5, 15],
  blotches: 80,
  speckles: 2600,
}

const BOULDERS = { count: 360, minScale: 0.06, maxScale: 0.42, color: '#8a827a' }

/**
 * Mercury: airless, cratered, brutally lit. Black sky full of stars, one
 * harsh white sun, and silence.
 */
export default function MercuryWorld() {
  return (
    <>
      <ambientLight intensity={0.06} />
      <directionalLight intensity={3.2} color="#fff8ec" position={[34, 22, -26]} />

      {/* Near-black sky so the stars read as airless-space stars */}
      <SkyDome top="#010204" mid="#040404" bottom="#0a0908" />
      <StarPoints count={1100} size={1.7} opacity={0.95} />

      <DistantSunSprite
        direction={[0.62, 0.4, -0.52]}
        distance={480}
        scale={17}
        color="#ffffff"
        opacity={1}
      />

      <RockyGround
        style={SURFACE}
        repeat={52}
        displacement={0.85}
        curvatureRadius={1050}
        tintA="#ffffff"
        tintB="#8d867e"
        bumpScale={0.09}
        boulders={BOULDERS}
      />
    </>
  )
}
