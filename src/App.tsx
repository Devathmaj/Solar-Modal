import { useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { SolarSystem } from './components/solar-system/SolarSystem'
import { VirtualPad } from './components/solar-system/VirtualPad'
import { initPointerGuard } from './components/planet-worlds/pointerGuard'
import { bindOverlay } from './components/planet-worlds/overlay'
import { bootFromHash } from './components/planet-worlds/worldState'
import { WorldTransition } from './components/planet-worlds/WorldTransition'
import { PlanetWorldRouter } from './components/planet-worlds/PlanetWorldRouter'
import { WorldHUD } from './components/planet-worlds/WorldHUD'
import { BodyProximityTrigger } from './components/planet-worlds/BodyProximityTrigger'
import { BodyHoverLabel } from './components/planet-worlds/BodyHoverLabel'

export default function App() {
  useEffect(() => {
    bootFromHash()
    return initPointerGuard(window.document.body)
  }, [])

  return (
    <>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 90, 160], fov: 45, near: 0.5, far: 1600 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.AgXToneMapping
          gl.toneMappingExposure = 1.25
        }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.15} />
        <SolarSystem />
        <PlanetWorldRouter />
        <WorldTransition />
        <BodyProximityTrigger />
      </Canvas>

      {/* Cursor-following "Visit <body>" pill */}
      <BodyHoverLabel />

      {/* Atmosphere veil painted by the transition controller */}
      <div
        ref={bindOverlay}
        className="world-overlay"
        aria-hidden
      />

      <WorldHUD />
      <VirtualPad />
    </>
  )
}
