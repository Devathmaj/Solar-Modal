import { Suspense, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Sun } from './Sun'
import { Planet } from './Planet'
import { Saturn } from './Saturn'
import { PLANET_TEXTURES } from './textures'

const ZOOM_TARGET = new THREE.Vector3(0, 0, -8)
const ZOOM_MIN_DISTANCE = 14
const ZOOM_MAX_DISTANCE = 220
const ZOOM_SENSITIVITY = 0.0015
const ZOOM_DAMPING = 5

function CameraControls() {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const targetDistance = useRef(camera.position.distanceTo(ZOOM_TARGET))

  useEffect(() => {
    camera.lookAt(ZOOM_TARGET)
    const domElement = gl.domElement
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const deltaY = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY
      targetDistance.current = THREE.MathUtils.clamp(
        targetDistance.current * Math.exp(deltaY * ZOOM_SENSITIVITY),
        ZOOM_MIN_DISTANCE,
        ZOOM_MAX_DISTANCE,
      )
    }
    domElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => domElement.removeEventListener('wheel', handleWheel)
  }, [camera, gl])

  useFrame((_, delta) => {
    const currentDistance = camera.position.distanceTo(ZOOM_TARGET)
    const nextDistance = THREE.MathUtils.damp(
      currentDistance,
      targetDistance.current,
      ZOOM_DAMPING,
      delta,
    )
    if (Math.abs(nextDistance - currentDistance) < 0.0005) return
    camera.position
      .sub(ZOOM_TARGET)
      .multiplyScalar(nextDistance / currentDistance)
      .add(ZOOM_TARGET)
  })

  return null
}

interface PlanetConfig {
  name: string
  texture: string
  radius: number
  position: [number, number, number]
  axialTilt?: number
}

const PLANETS: PlanetConfig[] = [
  {
    name: 'Mercury',
    texture: PLANET_TEXTURES.mercury,
    radius: 0.9,
    position: [12, 0, 18],
    axialTilt: 0.03,
  },
  {
    name: 'Venus',
    texture: PLANET_TEXTURES.venus,
    radius: 1.7,
    position: [-16, 0, 8],
    axialTilt: 2.6,
  },
  {
    name: 'Earth',
    texture: PLANET_TEXTURES.earth,
    radius: 1.8,
    position: [20, 0, 2],
    axialTilt: 23.4,
  },
  {
    name: 'Mars',
    texture: PLANET_TEXTURES.mars,
    radius: 1.3,
    position: [-26, 0, -4],
    axialTilt: 25.2,
  },
  {
    name: 'Jupiter',
    texture: PLANET_TEXTURES.jupiter,
    radius: 5.2,
    position: [-42, 0, -14],
    axialTilt: 3.1,
  },
]

const URANUS: PlanetConfig = {
  name: 'Uranus',
  texture: PLANET_TEXTURES.uranus,
  radius: 2.6,
  position: [-56, 0, -28],
  axialTilt: 97.8,
}

const NEPTUNE: PlanetConfig = {
  name: 'Neptune',
  texture: PLANET_TEXTURES.neptune,
  radius: 2.5,
  position: [54, 0, -32],
  axialTilt: 28.3,
}

const SATURN_RADIUS = 4.4

function toPlanet(config: PlanetConfig) {
  return (
    <Planet
      key={config.name}
      texture={config.texture}
      radius={config.radius}
      position={config.position}
      axialTilt={config.axialTilt}
    />
  )
}

export function SolarSystem() {
  return (
    <Suspense fallback={null}>
      <CameraControls />
      <Sun />
      {PLANETS.map(toPlanet)}
      <Saturn radius={SATURN_RADIUS} position={[38, 0, -20]} />
      {toPlanet(URANUS)}
      {toPlanet(NEPTUNE)}
    </Suspense>
  )
}
