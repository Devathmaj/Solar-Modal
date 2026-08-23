import { DistantSunSprite, RockyGround, SkyDome, StarPoints } from './WorldEnvironment'

/**
 * Mercury: airless, cratered, brutally lit. Black sky full of stars, one
 * harsh white sun, and silence.
 */
export default function MercuryWorld() {
  return (
    <>
      <ambientLight intensity={0.14} />
      <directionalLight intensity={2.6} color="#fff8ec" position={[34, 22, -26]} />

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
        texturePath="/assets/planets/mercury/2k_mercury.jpg"
        displacement={0.55}
        repeat={22}
        color="#d6cec4"
      />
    </>
  )
}
