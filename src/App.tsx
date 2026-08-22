import { Canvas } from '@react-three/fiber'
import { SolarSystem } from './components/solar-system/SolarSystem'

export default function App() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 90, 160], fov: 45, near: 0.5, far: 500 }}
    >
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.15} />
      <SolarSystem />
    </Canvas>
  )
}
