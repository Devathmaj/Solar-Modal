import type { BodyId, WorldMeta } from '../../config/planetWorlds'
import { WORLDS } from '../../config/planetWorlds'
import { paintOverlay } from './overlay'

export type WorldPhase = 'idle' | 'entering' | 'inside' | 'exiting'

export interface WorldSnapshot {
  phase: WorldPhase
  worldId: BodyId | null
  /**
   * True while the solar-system scene is concealed (world mounted instead).
   * Flips back to false at the exact covered moment of the exit transition so
   * the solar system is visible again before the overlay fades.
   */
  solarHidden: boolean
}

type Listener = () => void

let snapshot: WorldSnapshot = { phase: 'idle', worldId: null, solarHidden: false }
const listeners = new Set<Listener>()

function setSnapshot(patch: Partial<WorldSnapshot>) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

export function subscribeWorld(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getWorldSnapshot(): WorldSnapshot {
  return snapshot
}

/** True when the free camera / solar-system input must be inert. */
export function isInputLocked(): boolean {
  return snapshot.phase !== 'idle'
}

let enterRequest: BodyId | null = null
let exitRequest = false
let pushedHistoryEntry = false

export function requestEnter(worldId: BodyId) {
  if (snapshot.phase !== 'idle') return
  if (!WORLDS[worldId]) return
  enterRequest = worldId
  setSnapshot({ phase: 'entering', worldId })
}

export function consumeEnterRequest(): BodyId | null {
  const request = enterRequest
  enterRequest = null
  return request
}

/**
 * User-facing exit (HUD button). Prefers browser-back so history stays
 * consistent; falls back to a direct transition when no entry was pushed.
 */
export function requestExit() {
  if (snapshot.phase !== 'inside') return
  if (pushedHistoryEntry && typeof window !== 'undefined' && window.history.length > 1) {
    pushedHistoryEntry = false
    window.history.back()
    return
  }
  beginExit()
}

/** Begin the exit transition regardless of history state (popstate path). */
export function beginExit() {
  if (snapshot.phase !== 'inside') return
  pushedHistoryEntry = false
  exitRequest = true
  setSnapshot({ phase: 'exiting' })
}

export function consumeExitRequest(): boolean {
  const request = exitRequest
  exitRequest = false
  return request
}

/** Called by the transition controller the moment the overlay fully covers. */
export function completeEnterCover() {
  if (snapshot.phase !== 'entering') return
  if (typeof window !== 'undefined' && snapshot.worldId) {
    pushedHistoryEntry = true
    window.history.pushState({ planetWorld: snapshot.worldId }, '', `#/${snapshot.worldId}`)
  }
  setSnapshot({ phase: 'inside', solarHidden: true })
}

/** Called at the covered moment of the exit: solar scene becomes visible. */
export function completeExitCover() {
  if (snapshot.phase !== 'exiting') return
  setSnapshot({ solarHidden: false })
}

/** Called when the exit pull-back finishes and input is restored. */
export function completeExit() {
  if (snapshot.phase !== 'exiting') return
  setSnapshot({ phase: 'idle', worldId: null })
  // Clean up deep-link hash when no history entry exists to pop (boot case).
  if (typeof window !== 'undefined' && window.location.hash.startsWith(HASH_PREFIX)) {
    window.history.pushState({}, '', window.location.pathname + window.location.search)
  }
}

const HASH_PREFIX = '#/'

function bodyIdFromHash(hash: string): BodyId | null {
  if (!hash.startsWith(HASH_PREFIX)) return null
  const id = hash.slice(HASH_PREFIX.length) as BodyId
  return WORLDS[id] ? id : null
}

/**
 * Supports deep links like `#/earth`: opens that world immediately (no
 * transition) with the overlay starting opaque, ready to reveal.
 */
export function bootFromHash() {
  if (typeof window === 'undefined') return
  if (snapshot.phase !== 'idle') return
  const id = bodyIdFromHash(window.location.hash)
  if (!id) return
  window.history.replaceState({ planetWorld: id }, '', window.location.hash)
  // Start fully veiled in the world's atmosphere colour; the transition
  // controller lifts the veil on its first frames.
  paintOverlay(WORLDS[id].fadeColor, 1)
  setSnapshot({ phase: 'inside', worldId: id, solarHidden: true })
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (snapshot.phase === 'inside') beginExit()
  })
}

export type { BodyId, WorldMeta }
