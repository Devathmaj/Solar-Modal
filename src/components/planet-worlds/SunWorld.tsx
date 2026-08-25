import { CloudPuffs, FlickerLight, GasWalls, ParticleField, TextureSkyDome } from './WorldEnvironment'
import { mirrorStops } from './worldAssets'
import { PLANET_ENHANCE } from '../solar-system/textures'

// Mirrored twin drives the seamless detail sheen over the real map.
const BAND_STOPS = mirrorStops(['#fff6d8', '#ffdf9a', '#ffae48', '#e87218', '#a83c08', '#5e1500'])


/**
 * Entering the Sun is not stepping onto a floor — the camera hangs inside a
 * stylized photosphere: the real granulation texture wraps around on a continuous
 * wall, sparks rise all around, and the whole surround glows with the solar ramp.
 * Uses real Sun texture for the sky dome background.
 */
export default function SunWorld() {
  const enhance = PLANET_ENHANCE.sun

  return (
    <>
      <ambientLight intensity={1.15} color="#ffd9a0" />
      <pointLight intensity={180} decay={2} distance={260} color="#fff3c4" position={[0, 14, 0]} />

      {/* Real Sun texture as the sky dome background */}
      <TextureSkyDome texturePath="/assets/planets/sun/2k_sun.jpg" tint="#fff2d0" opacity={0.7} />

      {/* Continuous photosphere wall clad in the real Sun granulation map */}
      <GasWalls
        stops={BAND_STOPS}
        texturePath="/assets/planets/sun/2k_sun.jpg"
        opacity={0.97}
        detailOpacity={0.14}
        tint="#fff2d0"
        hRepeat={2}
        driftSpeed={-0.005}
        bumpScale={0.3}
        enhance={enhance}
      />

      {/* Rising plasma sparks */}
      <ParticleField
        count={750}
        color="#ffe9a8"
        size={0.55}
        opacity={0.85}
        spread={[80, 44, 80]}
        riseSpeed={3.2}
        renderOrder={16}
      />
      <ParticleField
        count={300}
        color="#fff6d8"
        size={0.95}
        opacity={0.9}
        spread={[60, 36, 60]}
        riseSpeed={5}
        renderOrder={17}
      />

      <CloudPuffs count={10} color="#ffbe62" radius={55} height={4} band={10} minScale={22} maxScale={48} opacity={0.14} speed={0.006} />
      <FlickerLight color="#fff1b0" rate={3.5} intensity={130} position={[10, -6, -24]} />
    </>
  )
}
