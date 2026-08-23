/**
 * Distinguishes genuine clicks/taps from camera-look drags so planets are not
 * entered accidentally while the user orbits the view.
 */

let downX = 0
let downY = 0

export function initPointerGuard(element: HTMLElement) {
  const handlePointerDown = (event: PointerEvent) => {
    downX = event.clientX
    downY = event.clientY
  }
  element.addEventListener('pointerdown', handlePointerDown, true)
  return () => element.removeEventListener('pointerdown', handlePointerDown)
}

export function isTap(clientX: number, clientY: number): boolean {
  return Math.hypot(clientX - downX, clientY - downY) < 7
}
