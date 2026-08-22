import { Suspense, useEffect, useRef, type ComponentRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Sun } from './Sun'
import { Planet } from './Planet'
import { Saturn } from './Saturn'
import { AsteroidBelt } from './AsteroidBelt'
import { Starfield } from './Starfield'
import { PLANET_CONFIGS } from './config'

const CAMERA_TARGET: [number, number, number] = [0, 0, -8]
const ZOOM_MIN_DISTANCE = 14
const ZOOM_MAX_DISTANCE = 280
const POLAR_ANGLE_LIMIT = 0.2

function CameraControls() {
  const gl = useThree((state) => state.gl)
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const domElement = gl.domElement
    domElement.style.cursor = 'grab'
    const handleStart = () => {
      domElement.style.cursor = 'grabbing'
    }
    const handleEnd = () => {
      domElement.style.cursor = 'grab'
    }
    controls.addEventListener('start', handleStart)
    controls.addEventListener('end', handleEnd)
    return () => {
      controls.removeEventListener('start', handleStart)
      controls.removeEventListener('end', handleEnd)
      domElement.style.cursor = ''
    }
  }, [gl])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={CAMERA_TARGET}
      enablePan={false}
      enableDamping
      rotateSpeed={0.85}
      minDistance={ZOOM_MIN_DISTANCE}
      maxDistance={ZOOM_MAX_DISTANCE}
      minPolarAngle={POLAR_ANGLE_LIMIT}
      maxPolarAngle={Math.PI - POLAR_ANGLE_LIMIT}
    />
  )
}

export function SolarSystem() {
  return (
    <Suspense fallback={null}>
      <CameraControls />
      <Starfield />
      <Sun />
      {PLANET_CONFIGS.map((config) => (
        <Planet key={config.name} {...config} />
      ))}
      <Saturn />
      <AsteroidBelt />
    </Suspense>
  )
}
