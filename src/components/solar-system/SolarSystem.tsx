import { Suspense, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Sun } from './Sun'
import { Planet } from './Planet'
import { Saturn } from './Saturn'
import { AsteroidBelt } from './AsteroidBelt'
import { KuiperBelt } from './KuiperBelt'
import { ZodiacalLight } from './ZodiacalLight'
import { EarthMoon } from './EarthMoon'
import { GalileanMoons } from './GalileanMoons'
import { Starfield } from './Starfield'
import { MilkyWay } from './MilkyWay'
import { PLANET_CONFIGS, EARTH_CONFIG, JUPITER_CONFIG } from './config'
import {
  MOVEMENT_KEYS,
  pressedMovementKeys,
  releaseAllMovementKeys,
} from './movementInput'
import { subscribeToReset } from './cameraReset'

const UP = new THREE.Vector3(0, 1, 0)
const INITIAL_POSITION = new THREE.Vector3(0, 90, 160)
const INITIAL_VIEW_TARGET = new THREE.Vector3(0, 0, -8)
const INITIAL_ORIENTATION = (() => {
  const euler = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(INITIAL_POSITION, INITIAL_VIEW_TARGET, UP),
    'YXZ',
  )
  return { yaw: euler.y, pitch: euler.x }
})()
const MIN_CAMERA_RADIUS = 12
const MAX_CAMERA_RADIUS = 300
const PITCH_LIMIT = THREE.MathUtils.degToRad(85)
const LOOK_SENSITIVITY = 0.0032
const PITCH_SENSITIVITY = 0.0016
const ZOOM_SENSITIVITY = 0.0015
const FLIGHT_SPEED = 0.7
const ROTATION_DAMPING = 9
const MOVEMENT_DAMPING = 11
const RESET_MAX_DRAG_PIXELS = 6

const forwardVector = new THREE.Vector3()
const rightVector = new THREE.Vector3()
const candidatePosition = new THREE.Vector3()

function CameraControls() {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)

  const orientation = useRef({
    yaw: INITIAL_ORIENTATION.yaw,
    pitch: INITIAL_ORIENTATION.pitch,
    targetYaw: INITIAL_ORIENTATION.yaw,
    targetPitch: INITIAL_ORIENTATION.pitch,
  })

  const desiredPosition = useRef(INITIAL_POSITION.clone())
  const pointerTraces = useRef(new Map<number, { x: number; y: number; button: number }>())
  const pinchSpan = useRef(0)
  const rightButtonDragDistance = useRef<number | null>(null)

  const resetView = () => {
    releaseAllMovementKeys()
    desiredPosition.current.copy(INITIAL_POSITION)
    camera.position.copy(INITIAL_POSITION)
    const orientationState = orientation.current
    orientationState.targetYaw = INITIAL_ORIENTATION.yaw
    orientationState.targetPitch = INITIAL_ORIENTATION.pitch
    orientationState.yaw = INITIAL_ORIENTATION.yaw
    orientationState.pitch = INITIAL_ORIENTATION.pitch
    camera.rotation.set(INITIAL_ORIENTATION.pitch, INITIAL_ORIENTATION.yaw, 0)
  }

  const updateAxes = () => {
    const orientationState = orientation.current
    const cosPitch = Math.cos(orientationState.targetPitch)
    forwardVector.set(
      -Math.sin(orientationState.targetYaw) * cosPitch,
      Math.sin(orientationState.targetPitch),
      -Math.cos(orientationState.targetYaw) * cosPitch,
    )
    rightVector.crossVectors(forwardVector, UP).normalize()
  }

  const enforceRadius = () => {
    const radius = candidatePosition.length()
    if (radius < MIN_CAMERA_RADIUS) candidatePosition.multiplyScalar(MIN_CAMERA_RADIUS / radius)
    else if (radius > MAX_CAMERA_RADIUS) candidatePosition.multiplyScalar(MAX_CAMERA_RADIUS / radius)
  }

  const zoomBy = (factor: number) => {
    updateAxes()
    const step = desiredPosition.current.length() * (factor - 1)
    candidatePosition.copy(desiredPosition.current).addScaledVector(forwardVector, step)
    enforceRadius()
    desiredPosition.current.copy(candidatePosition)
  }

  const lookBy = (deltaX: number, deltaY: number) => {
    const orientationState = orientation.current
    orientationState.targetYaw -= deltaX * LOOK_SENSITIVITY
    orientationState.targetPitch = THREE.MathUtils.clamp(
      orientationState.targetPitch - deltaY * PITCH_SENSITIVITY,
      -PITCH_LIMIT,
      PITCH_LIMIT,
    )
  }

  useEffect(() => {
    camera.position.copy(INITIAL_POSITION)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(orientation.current.pitch, orientation.current.yaw, 0)

    const domElement = gl.domElement
    domElement.style.cursor = 'grab'
    domElement.style.touchAction = 'none'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (MOVEMENT_KEYS[event.code]) {
        event.preventDefault()
        pressedMovementKeys.add(event.code)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedMovementKeys.delete(event.code)
    }

    const handleWindowBlur = () => {
      releaseAllMovementKeys()
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      if (
        event.button === 2 &&
        rightButtonDragDistance.current !== null &&
        rightButtonDragDistance.current <= RESET_MAX_DRAG_PIXELS
      ) {
        resetView()
      }
      rightButtonDragDistance.current = null
    }

    const handlePointerDown = (event: PointerEvent) => {
      pointerTraces.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
      })
      if (event.button === 2) rightButtonDragDistance.current = 0
      domElement.setPointerCapture(event.pointerId)
      domElement.style.cursor = 'grabbing'
      if (pointerTraces.current.size === 2) pinchSpan.current = 0
    }

    const handlePointerMove = (event: PointerEvent) => {
      const trace = pointerTraces.current.get(event.pointerId)
      if (!trace) return
      const deltaX = event.clientX - trace.x
      const deltaY = event.clientY - trace.y
      trace.x = event.clientX
      trace.y = event.clientY
      if (trace.button === 2 && rightButtonDragDistance.current !== null) {
        rightButtonDragDistance.current += Math.abs(deltaX) + Math.abs(deltaY)
      }

      if (pointerTraces.current.size >= 2) {
        const points = [...pointerTraces.current.values()]
        const span = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
        if (pinchSpan.current > 0 && span > 0) zoomBy(pinchSpan.current / span)
        pinchSpan.current = span
        return
      }

      lookBy(deltaX, deltaY)
    }

    const endPointer = (event: PointerEvent) => {
      pointerTraces.current.delete(event.pointerId)
      pinchSpan.current = 0
      if (domElement.hasPointerCapture(event.pointerId)) {
        domElement.releasePointerCapture(event.pointerId)
      }
      if (pointerTraces.current.size === 0) domElement.style.cursor = 'grab'
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const deltaY = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY
      zoomBy(Math.exp(deltaY * ZOOM_SENSITIVITY))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)
    domElement.addEventListener('contextmenu', handleContextMenu)
    domElement.addEventListener('pointerdown', handlePointerDown)
    domElement.addEventListener('pointermove', handlePointerMove)
    domElement.addEventListener('pointerup', endPointer)
    domElement.addEventListener('pointercancel', endPointer)
    domElement.addEventListener('wheel', handleWheel, { passive: false })
    const unsubscribeReset = subscribeToReset(resetView)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
      domElement.removeEventListener('contextmenu', handleContextMenu)
      domElement.removeEventListener('pointerdown', handlePointerDown)
      domElement.removeEventListener('pointermove', handlePointerMove)
      domElement.removeEventListener('pointerup', endPointer)
      domElement.removeEventListener('pointercancel', endPointer)
      domElement.removeEventListener('wheel', handleWheel)
      unsubscribeReset()
      domElement.style.cursor = ''
      domElement.style.touchAction = ''
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    const orientationState = orientation.current

    const yaw = THREE.MathUtils.damp(orientationState.yaw, orientationState.targetYaw, ROTATION_DAMPING, delta)
    const pitch = THREE.MathUtils.damp(orientationState.pitch, orientationState.targetPitch, ROTATION_DAMPING, delta)
    if (yaw !== orientationState.yaw || pitch !== orientationState.pitch) {
      orientationState.yaw = yaw
      orientationState.pitch = pitch
      camera.rotation.set(pitch, yaw, 0)
    }

    let strafe = 0
    let forward = 0
    let lift = 0
    for (const code of pressedMovementKeys) {
      const direction = MOVEMENT_KEYS[code]
      if (direction) {
        strafe += direction[0]
        forward += direction[1]
        lift += direction[2]
      }
    }

    if (strafe !== 0 || forward !== 0 || lift !== 0) {
      updateAxes()
      const step = desiredPosition.current.length() * FLIGHT_SPEED * delta
      candidatePosition.copy(desiredPosition.current)
      candidatePosition.addScaledVector(forwardVector, forward * step)
      candidatePosition.addScaledVector(rightVector, strafe * step)
      candidatePosition.addScaledVector(UP, lift * step)
      enforceRadius()
      desiredPosition.current.copy(candidatePosition)
    }

    camera.position.lerp(desiredPosition.current, 1 - Math.exp(-MOVEMENT_DAMPING * delta))
  })

  return null
}

export function SolarSystem() {
  return (
    <Suspense fallback={null}>
      <CameraControls />
      <MilkyWay />
      <Starfield />
      <Sun />
      <ZodiacalLight />
      {PLANET_CONFIGS.map((config) => (
        <Planet key={config.name} {...config} />
      ))}
      <Planet {...EARTH_CONFIG}>
        <EarthMoon planetRadius={EARTH_CONFIG.radius} />
      </Planet>
      <Planet {...JUPITER_CONFIG}>
        <GalileanMoons />
      </Planet>
      <Saturn />
      <AsteroidBelt />
      <KuiperBelt />
    </Suspense>
  )
}
