import { CloudPuffs, ParticleField, SkyDome } from './WorldEnvironment'

/**
 * Venus: buried under crushing clouds. A warm amber gloom in every direction,
 * drifting sulfur haze, the surface nothing more than a rumour far below.
 */
export default function VenusWorld() {
  return (
    <>
      <ambientLight intensity={0.95} color="#ffd9a0" />
      <hemisphereLight args={['#ffd9a0', '#8a5a20', 0.85]} />

      <SkyDome top="#f2cf8a" mid="#d9a452" bottom="#9a651f" />

      {/* Dense drifting cloud decks */}
      <CloudPuffs count={18} color="#e8c07a" radius={48} height={7} band={7} minScale={20} maxScale={44} opacity={0.22} speed={0.01} />
      <CloudPuffs count={12} color="#c89347" radius={38} height={-4} band={6} minScale={26} maxScale={52} opacity={0.26} speed={-0.007} />
      <CloudPuffs count={8} color="#f5dfa8" radius={60} height={16} band={5} minScale={30} maxScale={58} opacity={0.14} speed={0.005} />

      {/* Sulfuric haze motes */}
      <ParticleField count={420} color="#eed9a8" size={0.32} opacity={0.3} spread={[56, 28, 56]} spinSpeed={0.012} />

      {/* Surface completely obscured — only a faint dark disc far below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -22, 0]}>
        <circleGeometry args={[220, 48]} />
        <meshBasicMaterial color="#6e4517" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </>
  )
}
