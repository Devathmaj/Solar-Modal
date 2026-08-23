import { useSyncExternalStore } from 'react'
import { WORLDS } from '../../config/planetWorlds'
import { getWorldSnapshot, requestExit, subscribeWorld } from './worldState'

/**
 * Minimal unobtrusive control available inside every planet world.
 */
export function WorldHUD() {
  const { phase, worldId } = useSyncExternalStore(subscribeWorld, getWorldSnapshot)

  if (phase !== 'inside' || !worldId) return null
  const meta = WORLDS[worldId]

  return (
    <div className="world-hud">
      <button type="button" className="world-return" onClick={() => requestExit()}>
        <span aria-hidden className="world-return-arrow">←</span>
        Return to Solar System
      </button>
      <span className="world-hud-title">{meta.title}</span>
    </div>
  )
}
