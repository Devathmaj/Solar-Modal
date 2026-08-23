import { Suspense, useSyncExternalStore } from 'react'
import { WORLDS, WORLD_COMPONENTS } from '../../config/planetWorlds'
import { getWorldSnapshot, subscribeWorld } from './worldState'
import { PlanetWorld } from './PlanetWorld'

/**
 * Mounts exactly one planet world at a time, lazily. The world appears while
 * the transition veil is fully opaque — initialization is concealed by the
 * travel itself instead of a loading screen.
 */
export function PlanetWorldRouter() {
  const { phase, worldId, solarHidden } = useSyncExternalStore(subscribeWorld, getWorldSnapshot)

  // solarHidden flips true at the covered moment of entry and false at the
  // covered moment of exit — the exact instants the world should mount/unmount.
  if (!worldId || !solarHidden || phase === 'idle') return null

  const World = WORLD_COMPONENTS[worldId]
  const meta = WORLDS[worldId]

  return (
    <Suspense fallback={null}>
      <PlanetWorld meta={meta}>
        <World />
      </PlanetWorld>
    </Suspense>
  )
}
