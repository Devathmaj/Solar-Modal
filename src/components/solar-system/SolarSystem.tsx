import { Suspense, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Sun } from './Sun'
import { Planet } from './Planet'
import { Saturn } from './Saturn'
import { PLANET_CONFIGS } from './config'

const ZOOM_TARGET = new THREE.Vector3(0, 0, -8)
const ZOOM_MIN_DISTANCE = 14
const ZOOM_MAX_DISTANCE = 280
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

export function SolarSystem() {
  return (
    <Suspense fallback={null}>
      <CameraControls />
      <Sun />
      {PLANET_CONFIGS.map((config) => (
        <Planet key={config.name} {...config} />
      ))}
      <Saturn />
    </Suspense>
  )
}
