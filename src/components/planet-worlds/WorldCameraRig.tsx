import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { WorldCameraConfig } from '../../config/planetWorlds'
import { getWorldSnapshot } from './worldState'

const LOOK_SENSITIVITY = 0.005
const PITCH_SENSITIVITY = 0.0026
const ZOOM_SENSITIVITY = 0.0016
const ROTATION_DAMPING = 7
const MOVEMENT_DAMPING = 8

/**
 * Planet worlds get their own restrained camera: an orbit around the world's
 * content anchor with clamped pitch and distance. It invites exploration but
 * can never wander out of the environment.
 */
export function WorldCameraRig({ config }: { config: WorldCameraConfig }) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)

  const anchor = useMemo(() => new THREE.Vector3(...config.anchor), [config])
  const initialPitch = THREE.MathUtils.clamp(
    config.initialPitch ?? 0.12,
    config.minPitch,
    config.maxPitch,
  )

  const orientation = useRef({
    yaw: config.initialYaw ?? 0,
    pitch: initialPitch,
    targetYaw: config.initialYaw ?? 0,
    targetPitch: initialPitch,
    radius: config.distance,
    targetRadius: config.distance,
  })

  const gesture = useRef({
    traces: new Map<number, { x: number; y: number }>(),
    pinchSpan: 0,
  })

  useEffect(() => {
    const orientationState = orientation.current
    const gestureState = gesture.current
    const domElement = gl.domElement

    // Place the camera at its initial orbital position.
    const offset = new THREE.Vector3(
      Math.sin(orientationState.targetYaw) * Math.cos(orientationState.targetPitch),
      Math.sin(orientationState.targetPitch),
      Math.cos(orientationState.targetYaw) * Math.cos(orientationState.targetPitch),
    ).multiplyScalar(orientationState.radius)
    camera.position.copy(anchor).add(offset)
    camera.lookAt(anchor)

    domElement.style.cursor = 'grab'

    const clampOrientation = () => {
      orientationState.targetPitch = THREE.MathUtils.clamp(
        orientationState.targetPitch,
        config.minPitch,
        config.maxPitch,
      )
      orientationState.targetRadius = THREE.MathUtils.clamp(
        orientationState.targetRadius,
        config.minDistance,
        config.maxDistance,
      )
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (getWorldSnapshot().phase !== 'inside') return
      gestureState.traces.set(event.pointerId, { x: event.clientX, y: event.clientY })
      domElement.setPointerCapture(event.pointerId)
      domElement.style.cursor = 'grabbing'
      if (gestureState.traces.size === 2) gestureState.pinchSpan = 0
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (getWorldSnapshot().phase !== 'inside') return
      const trace = gestureState.traces.get(event.pointerId)
      if (!trace) return
      const deltaX = event.clientX - trace.x
      const deltaY = event.clientY - trace.y
      trace.x = event.clientX
      trace.y = event.clientY

      if (gestureState.traces.size >= 2) {
        const points = [...gestureState.traces.values()]
        const span = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
        if (gestureState.pinchSpan > 0 && span > 0) {
          orientationState.targetRadius *= gestureState.pinchSpan / span
          clampOrientation()
        }
        gestureState.pinchSpan = span
        return
      }

      orientationState.targetYaw -= deltaX * LOOK_SENSITIVITY
      orientationState.targetPitch += deltaY * PITCH_SENSITIVITY
      clampOrientation()
    }

    const endPointer = (event: PointerEvent) => {
      gestureState.traces.delete(event.pointerId)
      gestureState.pinchSpan = 0
      if (domElement.hasPointerCapture(event.pointerId)) {
        domElement.releasePointerCapture(event.pointerId)
      }
      if (gestureState.traces.size === 0) domElement.style.cursor = 'grab'
    }

    const handleWheel = (event: WheelEvent) => {
      if (getWorldSnapshot().phase !== 'inside') return
      event.preventDefault()
      const deltaY = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY
      orientationState.targetRadius *= Math.exp(deltaY * ZOOM_SENSITIVITY)
      clampOrientation()
    }

    domElement.addEventListener('pointerdown', handlePointerDown)
    domElement.addEventListener('pointermove', handlePointerMove)
    domElement.addEventListener('pointerup', endPointer)
    domElement.addEventListener('pointercancel', endPointer)
    domElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown)
      domElement.removeEventListener('pointermove', handlePointerMove)
      domElement.removeEventListener('pointerup', endPointer)
      domElement.removeEventListener('pointercancel', endPointer)
      domElement.removeEventListener('wheel', handleWheel)
      domElement.style.cursor = ''
    }
  }, [camera, gl, anchor, config])

  const framePosition = useRef(new THREE.Vector3())
  const frameOffset = useRef(new THREE.Vector3())
  const frameLookTarget = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    if (getWorldSnapshot().phase !== 'inside') return
    const o = orientation.current

    o.yaw = THREE.MathUtils.damp(o.yaw, o.targetYaw, ROTATION_DAMPING, delta)
    o.pitch = THREE.MathUtils.damp(o.pitch, o.targetPitch, ROTATION_DAMPING, delta)
    o.radius = THREE.MathUtils.damp(o.radius, o.targetRadius, MOVEMENT_DAMPING, delta)

    // Gentle idle drift keeps atmospheric worlds feeling alive.
    const drift = config.drift ?? 0
    const bob = Math.sin(state.clock.elapsedTime * 0.45) * drift

    frameOffset.current.set(
      Math.sin(o.yaw) * Math.cos(o.pitch),
      Math.sin(o.pitch),
      Math.cos(o.yaw) * Math.cos(o.pitch),
    ).multiplyScalar(o.radius)

    framePosition.current.copy(anchor).add(frameOffset.current)
    framePosition.current.y += bob
    camera.position.copy(framePosition.current)

    frameLookTarget.current.copy(anchor)
    frameLookTarget.current.y += bob * 0.55
    camera.lookAt(frameLookTarget.current)
  })

  return null
}
