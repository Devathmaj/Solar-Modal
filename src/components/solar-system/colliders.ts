import * as THREE from 'three'

export interface Collider {
  readonly id: string
  readonly radius: number
  readonly center: THREE.Vector3
}

const colliders = new Map<string, Collider>()

export function registerCollider(id: string, radius: number) {
  const existing = colliders.get(id)
  if (existing) {
    colliders.set(id, { ...existing, radius })
    return
  }
  colliders.set(id, { id, radius, center: new THREE.Vector3() })
}

export function unregisterCollider(id: string) {
  colliders.delete(id)
}

export function syncColliderWithObject(id: string, object: THREE.Object3D) {
  const collider = colliders.get(id)
  if (collider) object.getWorldPosition(collider.center)
}

export function forEachCollider(callback: (collider: Collider) => void) {
  colliders.forEach(callback)
}

export function getCollider(id: string): Collider | undefined {
  return colliders.get(id)
}
