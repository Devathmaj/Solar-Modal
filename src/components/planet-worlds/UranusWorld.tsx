import { CloudPuffs, ParticleField, TextureSkyDome } from './WorldEnvironment'


/**
 * Uranus: an almost featureless teal-calm. Feature-poor on purpose —
 * the serenity *is* the identity of this world. Uses the Solar System Scope
 * equirectangular Uranus map on a sky dome (no stitched cylindrical composite).
 */
export default function UranusWorld() {
  return (
    <>
      <ambientLight intensity={0.65} color="#d8f2f0" />
      <hemisphereLight args={['#dff4f4', '#2e5a62', 0.6]} />
      <directionalLight intensity={0.9} color="#e8fbf9" position={[36, 62, -30]} />

      {/* Real Uranus equirectangular map as the sky dome — seamless, no composite seam */}
      <TextureSkyDome texturePath="/assets/planets/uranus/2k_uranus.jpg" tint="#c8eeea" opacity={0.92} />

      {/* Sparse bright methane-ice wisps */}
      <CloudPuffs count={7} color="#ffffff" radius={24} height={8} band={6} minScale={7} maxScale={16} opacity={0.16} speed={0.01} />

      {/* Faint methane deck drifting inside the wall */}
      <CloudPuffs count={10} color="#e4f7f5" radius={32} height={6} band={5} minScale={16} maxScale={34} opacity={0.14} speed={0.007} />
      <CloudPuffs count={8} color="#3f868c" radius={28} height={-5} band={4} minScale={18} maxScale={34} opacity={0.15} speed={-0.009} />

      {/* Sparse, slow methane haze */}
      <ParticleField
        count={300}
        color="#dff6f4"
        size={0.18}
        opacity={0.22}
        spread={[44, 22, 44]}
        spinSpeed={0.01}
      />
    </>
  )
}
