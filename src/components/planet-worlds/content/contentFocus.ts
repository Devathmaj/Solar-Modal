import { useSyncExternalStore } from 'react'
import type { BodyId } from '../../../config/planetWorlds'
import { layoutItems } from './layout'

export interface FocusSnapshot {
  worldId: BodyId | null
  itemId: string | null
}

let state: FocusSnapshot = { worldId: null, itemId: null }
const listeners = new Set<() => void>()

function set(next: FocusSnapshot) {
  state = next
  listeners.forEach((listener) => listener())
}

export function subscribeFocus(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getFocusSnapshot(): FocusSnapshot {
  return state
}

export function openItem(worldId: BodyId, itemId: string) {
  set({ worldId, itemId })
}

export function closeFocus() {
  set({ worldId: null, itemId: null })
}

export function stepFocus(delta: number) {
  if (!state.worldId || !state.itemId) return
  const ids = layoutItems(state.worldId).map((layout) => layout.id)
  const index = ids.indexOf(state.itemId)
  if (index === -1) return
  const next = (index + delta + ids.length) % ids.length
  set({ worldId: state.worldId, itemId: ids[next] })
}

export function useFocusSnapshot(): FocusSnapshot {
  return useSyncExternalStore(subscribeFocus, getFocusSnapshot)
}
