import { DistantSunSprite, TextureGround, TextureSkyDome, StarPoints } from './WorldEnvironment'

const BOULDERS = { count: 600, minScale: 0.08, maxScale: 0.6, color: '#8a827a' }

/**
 * Mercury: airless, heavily cratered world with extreme temperature differences.
 * No atmosphere means the sky is black, the sun is harsh, and every feature
 * is sharply defined by high-contrast lighting with sharp shadow definition.
 * Uses real Mercury surface texture mapped on curved terrain.
 */
export default function MercuryWorld() {
  return (
    <>
      {/* Harsh key light creating extreme contrast - no atmospheric fill */}
      <ambientLight intensity={0.1} />
      <directionalLight intensity={3.2} color="#fffaf0" position={[40, 30, -30]} />
      <directionalLight intensity={0.4} color="#7a8c7e" position={[-45, -15, 35]} />
      <hemisphereLight args={['#1a1a1a', '#0d0d0d', 0.3]} />

      {/* Starfield sky - real star texture on a sphere */}
      <TextureSkyDome texturePath="/assets/background/stars_only_2k.jpg" />
      <StarPoints count={1500} size={2.0} opacity={0.98} />

      <DistantSunSprite
        direction={[0.62, 0.4, -0.52]}
        distance={480}
        scale={17}
        color="#ffffff"
        opacity={1}
      />

      {/* Real Mercury surface texture on curved terrain */}
      <TextureGround
        texturePath="/assets/planets/mercury/2k_mercury.jpg"
        repeat={70}
        displacement={1.1}
        curvatureRadius={1200}
        tintA="#f5f0e7"
        tintB="#c9c4b8"
        bumpScale={0.2}
        carve={{ count: 40, minRadius: 10, maxRadius: 40, depth: 3.8, rim: 0.7 }}
        boulders={BOULDERS}
      />
    </>
  )
}