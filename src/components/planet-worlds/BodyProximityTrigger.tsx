import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { WORLDS, colliderIdForBody, type BodyId } from '../../config/planetWorlds'
import { getCollider } from '../solar-system/colliders'
import { getWorldSnapshot, requestEnter, subscribeWorld } from './worldState'

const TOUCH_FACTOR = 1.12
/** Grace window after returning — the pull-out ends near the body. */
const POST_EXIT_COOLDOWN_MS = 1400

/**
 * Fly-to-visit: while free-flying the solar system, touching a celestial
 * body's surface automatically enters its world. Uses the live collider
 * registry (positions synced every frame by the bodies themselves), so no
 * extra per-body work is added. Idle state only — never fires mid-transition,
 * and stays quiet briefly after a return so the exit pull-out cannot
 * immediately re-capture you.
 */
export function BodyProximityTrigger() {
  const camera = useThree((state) => state.camera)

  const bodies = useMemo(() => Object.keys(WORLDS) as BodyId[], [])
  const delta = useMemo(() => new THREE.Vector3(), [])
  const lastExitAt = useRef(0)

  useEffect(() => {
    return subscribeWorld(() => {
      if (getWorldSnapshot().phase === 'exiting') lastExitAt.current = performance.now()
    })
  }, [])

  useFrame(() => {
    if (getWorldSnapshot().phase !== 'idle') return
    if (performance.now() - lastExitAt.current < POST_EXIT_COOLDOWN_MS) return

    for (const bodyId of bodies) {
      const collider = getCollider(colliderIdForBody(bodyId))
      if (!collider) continue
      const distance = delta.copy(camera.position).sub(collider.center).length()
      // Slightly above surface contact so the transition starts before the
      // camera would clip through the mesh.
      if (distance <= collider.radius * TOUCH_FACTOR) {
        requestEnter(bodyId, 'touch')
        return
      }
    }
  })

  return null
}
