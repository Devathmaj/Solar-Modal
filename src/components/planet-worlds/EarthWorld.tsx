import { CloudPuffs, DistantSunSprite, ParticleField, RockyGround, SkyDome } from './WorldEnvironment'

/**
 * Earth: the richest world — blue scattering overhead, drifting cumulus,
 * soft green-brown terrain below, clean sunlight. Home.
 */
export default function EarthWorld() {
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight intensity={1.7} color="#fff6e6" position={[30, 34, -18]} />
      <hemisphereLight args={['#9ecbff', '#6a8f5a', 0.75]} />

      <SkyDome top="#2e6fd0" mid="#7fb4ea" bottom="#d9ecfb" />

      <DistantSunSprite
        direction={[0.45, 0.62, -0.4]}
        distance={470}
        scale={24}
        color="#fffbe8"
        opacity={0.95}
      />

      {/* Cumulus decks */}
      <CloudPuffs count={16} color="#ffffff" radius={46} height={10} band={5} minScale={16} maxScale={38} opacity={0.2} speed={0.008} />
      <CloudPuffs count={9} color="#f2f6ff" radius={60} height={19} band={4} minScale={26} maxScale={50} opacity={0.13} speed={-0.005} />

      <RockyGround
        texturePath="/assets/planets/earth/2k_earth_daymap.jpg"
        displacement={0.7}
        repeat={17}
        color="#cfe0cc"
      />

      {/* Faint near-ground sparkle: pollen / moisture in the air */}
      <ParticleField count={220} color="#ffffff" size={0.16} opacity={0.22} spread={[40, 14, 40]} spinSpeed={0.01} />
    </>
  )
}
