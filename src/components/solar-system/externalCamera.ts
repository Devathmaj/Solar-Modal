import type * as THREE from 'three'

type SyncFn = (position: THREE.Vector3, quaternion: THREE.Quaternion) => void

let syncFn: SyncFn | null = null

/**
 * The transition controller drives the shared camera during fly-in/out.
 * Afterwards it hands a final camera state back so the free-flight controls
 * can resume exactly where the transition ended instead of snapping.
 */
export function subscribeExternalCameraSync(fn: SyncFn) {
  syncFn = fn
  return () => {
    if (syncFn === fn) syncFn = null
  }
}

export function applyExternalCamera(position: THREE.Vector3, quaternion: THREE.Quaternion) {
  syncFn?.(position.clone(), quaternion.clone())
}
