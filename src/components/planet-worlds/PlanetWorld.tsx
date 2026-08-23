import { useEffect, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { WorldMeta } from '../../config/planetWorlds'
import { WorldCameraRig } from './WorldCameraRig'
import { PortfolioContent } from './PortfolioContent'

interface PlanetWorldProps {
  meta: WorldMeta
  children: ReactNode
}

/**
 * Reusable shell every celestial-body world is built from:
 *
 *   WorldEnvironment → per-world `children` (sky, fog palette, terrain…)
 *   WorldCamera      → clamped orbital rig (WorldCameraRig)
 *   WorldLighting    → provided by each world (atmosphere-specific)
 *   WorldContent     → PortfolioContent anchored inside the world
 *   ExitTransition   → handled globally by WorldTransition + HUD
 */
export function PlanetWorld({ meta, children }: PlanetWorldProps) {
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    let fog: THREE.FogExp2 | null = null
    if (meta.fog) {
      fog = new THREE.FogExp2(meta.fog[0], meta.fog[1])
      scene.fog = fog
    }
    return () => {
      if (scene.fog === fog) scene.fog = null
    }
  }, [scene, meta])

  return (
    <>
      <WorldCameraRig config={meta.camera} />
      {children}
      <PortfolioContent meta={meta} />
    </>
  )
}
