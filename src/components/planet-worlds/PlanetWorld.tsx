import { useEffect, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { BodyId, WorldMeta } from '../../config/planetWorlds'
import { WorldCameraRig } from './WorldCameraRig'
import { ContentLayer } from './content/ContentLayer'
import { closeFocus } from './content/contentFocus'

interface PlanetWorldProps {
  meta: WorldMeta
  bodyId: BodyId
  children: ReactNode
}

/**
 * Reusable shell every celestial-body world is built from:
 *
 *   WorldEnvironment → per-world `children` (sky, fog palette, terrain…)
 *   WorldCamera      → clamped orbital rig with item-focus gliding
 *   WorldLighting    → provided by each world (atmosphere-specific)
 *   WorldContent     → ContentLayer (overview card + ambient items)
 *   ExitTransition   → handled globally by WorldTransition + HUD
 */
export function PlanetWorld({ meta, bodyId, children }: PlanetWorldProps) {
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    let fog: THREE.FogExp2 | null = null
    if (meta.fog) {
      fog = new THREE.FogExp2(meta.fog[0], meta.fog[1])
      scene.fog = fog
    }
    return () => {
      if (scene.fog === fog) scene.fog = null
      // Never leak a focused item across worlds.
      closeFocus()
    }
  }, [scene, meta])

  return (
    <>
      <WorldCameraRig config={meta.camera} bodyId={bodyId} />
      {children}
      <ContentLayer bodyId={bodyId} meta={meta} />
    </>
  )
}
