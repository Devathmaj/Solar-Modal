export const MOVEMENT_KEYS: Record<string, [number, number, number]> = {
  KeyW: [0, 1, 0],
  ArrowUp: [0, 1, 0],
  KeyS: [0, -1, 0],
  ArrowDown: [0, -1, 0],
  KeyA: [-1, 0, 0],
  ArrowLeft: [-1, 0, 0],
  KeyD: [1, 0, 0],
  ArrowRight: [1, 0, 0],
  KeyE: [0, 0, 1],
  KeyQ: [0, 0, -1],
}

export const pressedMovementKeys = new Set<string>()

export function pressMovementKey(code: string) {
  pressedMovementKeys.add(code)
}

export function releaseMovementKey(code: string) {
  pressedMovementKeys.delete(code)
}

export function releaseAllMovementKeys() {
  pressedMovementKeys.clear()
}
