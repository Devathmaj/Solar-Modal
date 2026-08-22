import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Source: ESA/Gaia/DPAC — "The colour of the sky from Gaia's Early Data Release 3",
// equirectangular all-sky variant. Acknowledgement: A. Moitinho.
// https://www.esa.int/ESA_Multimedia/Images/2020/12/The_colour_of_the_sky_from_Gaia_s_Early_Data_Release_32
// License: CC BY-SA 3.0 IGO (https://creativecommons.org/licenses/by-sa/3.0/igo/)
// The map represents the measured brightness/colour of ~1.8 billion Gaia stars;
// the galactic plane, dust lanes, Magellanic Clouds and other large-scale
// structure are real survey features.
// Projection/orientation: the source is an equirectangular map in GALACTIC
// coordinates (horizontal axis = galactic longitude -180..180 deg, image centre
// = galactic centre; vertical axis = galactic latitude). Each texel is placed at
// its true equatorial direction via the IAU J2000 galactic reference frame:
// galactic centre RA=266.405 deg Dec=-28.93617, north galactic pole
// RA=192.85948 Dec=27.12825, third axis = centre x pole. No artistic rotation.
// Asset note: shipped as a 4096x2048 JPEG derivative of the 4000x2000 source PNG,
// partially desaturated (35% chroma retained) so only subtle warm/cool colour
// variation survives; structure comes entirely from the real survey data.
// Intensity tuning: SKY_TINT scales the whole layer; keep it low so the band
// stays barely visible ("discoverable, not dominant").
const SKY_TEXTURE_URL = '/assets/background/milkyway_gaia_edr3_4k.jpg'
const SKY_TINT = '#17181b'

const SKY_RADIUS = 1250
const SKY_LONGITUDE_SEGMENTS = 256
const SKY_LATITUDE_SEGMENTS = 128
const GALACTIC_CENTER_RA = 266.405
const GALACTIC_CENTER_DEC = -28.93617
const NORTH_GALACTIC_POLE_RA = 192.85948
const NORTH_GALACTIC_POLE_DEC = 27.12825

function equatorialVector(raDeg: number, decDeg: number, target: THREE.Vector3) {
  const raRad = THREE.MathUtils.degToRad(raDeg)
  const decRad = THREE.MathUtils.degToRad(decDeg)
  return target.set(
    Math.cos(decRad) * Math.cos(raRad),
    Math.sin(decRad),
    Math.cos(decRad) * Math.sin(raRad),
  )
}

function createSkyDomeGeometry() {
  const centerAxis = equatorialVector(GALACTIC_CENTER_RA, GALACTIC_CENTER_DEC, new THREE.Vector3())
  const poleAxis = equatorialVector(NORTH_GALACTIC_POLE_RA, NORTH_GALACTIC_POLE_DEC, new THREE.Vector3())
  const longitudeAxis = new THREE.Vector3().crossVectors(centerAxis, poleAxis).normalize()

  const direction = new THREE.Vector3()
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let iy = 0; iy <= SKY_LATITUDE_SEGMENTS; iy++) {
    const latitude = (iy / SKY_LATITUDE_SEGMENTS) * 180 - 90
    const cosLat = Math.cos(THREE.MathUtils.degToRad(latitude))
    const sinLat = Math.sin(THREE.MathUtils.degToRad(latitude))
    for (let ix = 0; ix <= SKY_LONGITUDE_SEGMENTS; ix++) {
      const longitude = (ix / SKY_LONGITUDE_SEGMENTS) * 360 - 180
      const lonRad = THREE.MathUtils.degToRad(longitude)
      direction
        .copy(centerAxis)
        .multiplyScalar(cosLat * Math.cos(lonRad))
        .addScaledVector(longitudeAxis, cosLat * Math.sin(lonRad))
        .addScaledVector(poleAxis, sinLat)
        .normalize()
      positions.push(direction.x * SKY_RADIUS, direction.y * SKY_RADIUS, direction.z * SKY_RADIUS)
      uvs.push((longitude + 180) / 360, (latitude + 90) / 180)
    }
  }

  const columns = SKY_LONGITUDE_SEGMENTS + 1
  for (let iy = 0; iy < SKY_LATITUDE_SEGMENTS; iy++) {
    for (let ix = 0; ix < SKY_LONGITUDE_SEGMENTS; ix++) {
      const a = iy * columns + ix
      indices.push(a, a + columns, a + 1)
      indices.push(a + 1, a + columns, a + columns + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

export function MilkyWay() {
  const gl = useThree((state) => state.gl)
  const map = useTexture(SKY_TEXTURE_URL)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = gl.capabilities.getMaxAnisotropy()
  map.needsUpdate = true

  const geometry = useMemo(() => createSkyDomeGeometry(), [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshBasicMaterial
        map={map}
        color={SKY_TINT}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
