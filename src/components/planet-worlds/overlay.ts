/**
 * The transition overlay is a DOM element painted imperatively from the R3F
 * render loop. Keeping it outside React avoids re-rendering the tree at 60fps
 * during transitions.
 */

let element: HTMLDivElement | null = null
let currentOpacity = 0
let currentColor = '#000000'

export function bindOverlay(node: HTMLDivElement | null) {
  element = node
  if (element) paint()
}

export function overlayOpacity() {
  return currentOpacity
}

export function overlayColor() {
  return currentColor
}

export function paintOverlay(color: string, opacity: number) {
  currentColor = color
  currentOpacity = opacity
  paint()
}

function paint() {
  if (!element) return
  element.style.backgroundColor = currentColor
  element.style.opacity = currentOpacity.toFixed(3)
}
