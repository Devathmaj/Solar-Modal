/**
 * The hover label ("Visit Jupiter") is a DOM element painted imperatively
 * from R3F pointer handlers — no React re-renders on mouse move.
 */

let element: HTMLDivElement | null = null
let currentText: string | null = null

export function bindHoverLabel(node: HTMLDivElement | null) {
  element = node
  if (element && currentText) return
  if (element) element.style.opacity = '0'
}

export function hideHoverLabel() {
  currentText = null
  if (element) element.style.opacity = '0'
}

export function showHoverLabel(text: string, clientX: number, clientY: number) {
  currentText = text
  paintAt(clientX, clientY)
}

export function moveHoverLabel(clientX: number, clientY: number) {
  if (currentText) paintAt(clientX, clientY)
}

function paintAt(clientX: number, clientY: number) {
  if (!element || !currentText) return
  element.textContent = currentText
  element.style.opacity = '1'
  const x = Math.min(clientX + 16, window.innerWidth - 150)
  const y = Math.min(clientY + 18, window.innerHeight - 44)
  element.style.transform = `translate(${x}px, ${y}px)`
}
