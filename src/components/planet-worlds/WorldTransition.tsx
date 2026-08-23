import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { BodyId } from '../../config/planetWorlds'
import { WORLDS, colliderIdForBody } from '../../config/planetWorlds'
import {
  completeEnterCover,
  completeExit,
  completeExitCover,
  consumeEnterRequest,
  consumeExitRequest,
  getWorldSnapshot,
} from './worldState'
import { paintOverlay, overlayOpacity } from './overlay'
import { getCollider } from '../solar-system/colliders'
import { applyExternalCamera } from '../solar-system/externalCamera'

const UP = new THREE.Vector3(0, 1, 0)

/** Travel feels physical but never keeps the user waiting. */
const ENTER_DURATION = 2.3
const REVEAL_DURATION = 1.15
const EXIT_COVER_DURATION = 0.85
const EXIT_PULL_DURATION = 1.6

/**
 * Distance at which a sphere of radius r fills (slightly overfills) the
 * vertical field of view — the "surface envelops the camera" framing point.
 */
function fillDistance(radius: number, fovDeg: number) {
  return Math.max((radius / Math.tan(THREE.MathUtils.degToRad(fovDeg / 2))) * 0.55, radius * 1.2)
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Maximum initial velocity — a touch-entry must react instantly. */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

type Mode = 'idle' | 'enter' | 'reveal' | 'exitCover' | 'exitPull'

interface TransitionState {
  mode: Mode
  t: number
  bodyId: BodyId | ''
  fadeColor: string
  entrySource: 'click' | 'touch'
  startPos: THREE.Vector3
  startQuat: THREE.Quaternion
  direction: THREE.Vector3
  fillDist: number
  /** Camera state to restore when flying back out of a world. */
  savedPos: THREE.Vector3
  savedQuat: THREE.Quaternion
  departurePos: THREE.Vector3
  departureQuat: THREE.Quaternion
}

/**
 * Owns the shared camera during world transitions:
 *
 *   enter      — accelerate toward the live celestial body until its surface
 *                overflows the viewport while an atmosphere-coloured veil
 *                envelops the lens
 *   reveal     — the veil lifts off the newly mounted planet world
 *   exitCover  — the veil returns (leaving the body)
 *   exitPull   — scene swaps back under full cover, then the camera pulls
 *                away from the planet as the veil fades
 *
 * The existing planet mesh is never clipped through: the scene swap happens
 * while the veil is fully opaque.
 */
export function WorldTransition() {
  const camera = useThree((state) => state.camera)

  const scratch = useMemo(
    () => ({
      center: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      push: new THREE.Vector3(),
      lookMatrix: new THREE.Matrix4(),
      lookQuat: new THREE.Quaternion(),
    }),
    [],
  )

  const state = useRef<TransitionState>({
    mode: 'idle',
    t: 0,
    bodyId: '',
    fadeColor: '#000000',
    entrySource: 'click',
    startPos: new THREE.Vector3(),
    startQuat: new THREE.Quaternion(),
    direction: new THREE.Vector3(),
    fillDist: 1,
    savedPos: new THREE.Vector3(),
    savedQuat: new THREE.Quaternion(),
    departurePos: new THREE.Vector3(),
    departureQuat: new THREE.Quaternion(),
  })

  const lookAtPoint = (eye: THREE.Vector3, target: THREE.Vector3) => {
    scratch.lookMatrix.lookAt(eye, target, UP)
    return scratch.lookQuat.setFromRotationMatrix(scratch.lookMatrix)
  }

  useFrame((_, delta) => {
    const s = state.current

    // --- detect requests -------------------------------------------------
    if (s.mode === 'idle') {
      // Deep link (e.g. `#/earth`): world mounted directly under an opaque
      // veil — lift it exactly like a post-travel reveal.
      if (getWorldSnapshot().phase === 'inside') {
        const active = getWorldSnapshot().worldId
        if (active && overlayOpacity() > 0.01) {
          s.bodyId = active
          s.fadeColor = WORLDS[active].fadeColor
          s.t = 0
          s.mode = 'reveal'
          return
        }
      }

      const enterRequest = consumeEnterRequest()
      if (enterRequest) {
        const collider = getCollider(colliderIdForBody(enterRequest.id))
        if (collider) {
          const fov = (camera as THREE.PerspectiveCamera).fov ?? 45
          s.bodyId = enterRequest.id
          s.entrySource = enterRequest.source
          s.fadeColor = WORLDS[enterRequest.id].fadeColor
          s.startPos.copy(camera.position)
          s.startQuat.copy(camera.quaternion)
          s.savedPos.copy(camera.position)
          s.savedQuat.copy(camera.quaternion)
          s.direction.copy(s.startPos).sub(collider.center)
          if (s.direction.lengthSq() < 1e-6) s.direction.set(0.4, 0.3, 0.86)
          s.direction.normalize()
          s.fillDist = fillDistance(collider.radius, fov)
          // A touch-entry already sits inside the fill framing (the body
          // overfills the viewport at 1.12r) — never drift back outward.
          if (enterRequest.source === 'touch') {
            s.fillDist = Math.min(s.fillDist, collider.radius * 1.12 * 0.99)
          }
          s.t = 0
          s.mode = 'enter'
          return
        }
      }

      if (consumeExitRequest()) {
        s.fadeColor = s.bodyId ? WORLDS[s.bodyId].fadeColor : '#000000'
        s.t = 0
        s.mode = 'exitCover'
        return
      }
    }

    switch (s.mode) {
      // --- approach ------------------------------------------------------
      case 'enter': {
        const touch = s.entrySource === 'touch'
        s.t += delta / (touch ? 1.5 : ENTER_DURATION)
        const k = Math.min(s.t, 1)
        // Touch entries must react with maximum initial velocity.
        const eased = touch ? easeOutCubic(k) : easeInOutCubic(k)
        const collider = getCollider(colliderIdForBody(s.bodyId))

        if (!collider) {
          // Safety valve: target vanished (should not happen) — cover & swap.
          completeEnterCover()
          s.mode = 'reveal'
          s.t = 0
          break
        }

        scratch.center.copy(collider.center)
        scratch.endPos.copy(scratch.center).addScaledVector(s.direction, s.fillDist)
        camera.position.lerpVectors(s.startPos, scratch.endPos, eased)

        // Orbiting bodies keep moving during the approach — clamp the camera
        // to a hard minimum distance from the live centre so it can never be
        // carried inside the mesh (no hollow-backface glimpse, ever).
        const minDistance = Math.max(s.fillDist, collider.radius * 1.05)
        scratch.push.copy(camera.position).sub(scratch.center)
        if (scratch.push.length() < minDistance) {
          scratch.push.setLength(minDistance)
          camera.position.copy(scratch.center).add(scratch.push)
        }

        const qLook = lookAtPoint(camera.position, scratch.center)
        camera.quaternion.slerpQuaternions(s.startQuat, qLook, eased)

        // Veil ramps late on click travel so the journey stays visible; on a
        // touch it envelops almost immediately — the body was already hit.
        const veil = THREE.MathUtils.smoothstep(k, touch ? 0.12 : 0.55, touch ? 0.88 : 0.97)
        paintOverlay(s.fadeColor, veil)

        if (s.t >= 1) {
          completeEnterCover()
          s.mode = 'reveal'
          s.t = 0
        }
        break
      }

      // --- unveiling inside the world ------------------------------------
      case 'reveal': {
        s.t += delta / REVEAL_DURATION
        const k = Math.min(s.t, 1)
        paintOverlay(s.fadeColor, 1 - easeInOutCubic(k))
        if (s.t >= 1) {
          paintOverlay(s.fadeColor, 0)
          s.mode = 'idle'
        }
        break
      }

      // --- covering before leaving ---------------------------------------
      case 'exitCover': {
        s.t += delta / EXIT_COVER_DURATION
        const k = Math.min(s.t, 1)
        paintOverlay(s.fadeColor, easeInOutCubic(k))
        if (s.t >= 1) {
          completeExitCover()

          const collider = getCollider(colliderIdForBody(s.bodyId))
          if (collider) scratch.center.copy(collider.center)
          else scratch.center.set(0, 0, 0)
          const radius = collider ? collider.radius : 2
          const outDir = scratch.endPos.copy(s.savedPos).sub(scratch.center)

          // Safety clamp: a proximity dive saves a position *at* the body.
          // Never restore to inside trigger range — push the return point to
          // a clean standoff so slow-revolving bodies cannot re-capture you.
          const safeDistance = Math.max(radius * 1.7, radius + 3)
          if (outDir.length() < safeDistance) {
            if (outDir.lengthSq() < 1e-6) outDir.copy(s.direction)
            outDir.normalize()
            s.savedPos.copy(scratch.center).addScaledVector(outDir, safeDistance)
          }

          if (outDir.lengthSq() < 1e-6) outDir.set(0.4, 0.3, 0.86)
          outDir.normalize()
          s.departurePos
            .copy(scratch.center)
            .addScaledVector(outDir, Math.max(radius * 2.4, radius + 2))
          s.departureQuat.copy(lookAtPoint(s.departurePos, scratch.center))
          camera.position.copy(s.departurePos)
          camera.quaternion.copy(s.departureQuat)

          s.mode = 'exitPull'
          s.t = 0
        }
        break
      }

      // --- pulling away from the body -------------------------------------
      case 'exitPull': {
        s.t += delta / EXIT_PULL_DURATION
        const k = Math.min(s.t, 1)
        const eased = easeInOutCubic(k)
        camera.position.lerpVectors(s.departurePos, s.savedPos, eased)
        camera.quaternion.slerpQuaternions(s.departureQuat, s.savedQuat, eased)
        paintOverlay(s.fadeColor, 1 - eased)
        if (s.t >= 1) {
          applyExternalCamera(s.savedPos, s.savedQuat)
          paintOverlay(s.fadeColor, 0)
          completeExit()
          s.mode = 'idle'
        }
        break
      }

      default:
        break
    }
  })

  return null
}
