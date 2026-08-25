import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ContentItem } from '../../../content/types'
import type { BodyId } from '../../../config/planetWorlds'
import { getWorldSnapshot } from '../worldState'
import {
  hideHoverLabel,
  moveHoverLabel,
  showHoverLabel,
} from '../bodyHover'
import { openItem, useFocusSnapshot } from './contentFocus'
import { KIND_COLORS } from './layout'

/**
 * Ambient 3D representation of a single content item — a small themed
 * artefact bobbing on the world's item ring. Click to focus (camera glide +
 * detail panel); hover shows the same "Open …" pill used in the solar system.
 */
export function AmbientItem({
  bodyId,
  item,
  position,
}: {
  bodyId: BodyId
  item: ContentItem
  position: [number, number, number]
}) {
  const gl = useThree((state) => state.gl)
  const group = useRef<THREE.Group>(null!)
  const focus = useFocusSnapshot()
  const isFocused = focus.worldId === bodyId && focus.itemId === item.id
  const anyFocused = Boolean(focus.itemId)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const color = KIND_COLORS[item.kind]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.position.y =
        position[1] + Math.sin(t * 1.1 + phase) * 0.12 + (isFocused ? 0.15 : 0)
      group.current.rotation.y = t * 0.25 + phase
    }
    const mesh = group.current?.children.find((child) => child instanceof THREE.Mesh) as
      | THREE.Mesh
      | undefined
    const material = mesh?.material as THREE.MeshStandardMaterial | undefined
    if (material) {
      material.emissiveIntensity = isFocused ? 0.55 + Math.sin(t * 5) * 0.2 : 0.3
    }
  })

  const handlers = {
    onPointerOver: (event: { stopPropagation: () => void; clientX: number; clientY: number }) => {
      event.stopPropagation()
      if (getWorldSnapshot().phase !== 'inside') return
      gl.domElement.style.cursor = 'pointer'
      showHoverLabel(`Open ${item.title}`, event.clientX, event.clientY)
    },
    onPointerMove: (event: { clientX: number; clientY: number }) => {
      if (getWorldSnapshot().phase !== 'inside') return
      moveHoverLabel(event.clientX, event.clientY)
    },
    onPointerOut: () => {
      hideHoverLabel()
      gl.domElement.style.cursor = ''
    },
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation()
      if (getWorldSnapshot().phase !== 'inside') return
      hideHoverLabel()
      gl.domElement.style.cursor = ''
      openItem(bodyId, item.id)
    },
  }

  return (
    <group ref={group} position={position}>
      <group {...handlers}>
        <ItemGeometry kind={item.kind} color={color} />
      </group>
      <Html position={[0, -0.85, 0]} center zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`item-label${anyFocused && !isFocused ? ' item-label-dim' : ''}`}>
          {item.title}
        </div>
      </Html>
    </group>
  )
}

function ItemGeometry({ kind, color }: { kind: string; color: string }) {
  const emissive = useMemo(() => new THREE.Color(color), [color])

  switch (kind) {
    case 'pod':
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.4, 24, 16]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh rotation={[Math.PI / 2.6, 0, 0]}>
            <torusGeometry args={[0.58, 0.045, 10, 40]} />
            <meshStandardMaterial color="#dfe9f5" roughness={0.4} metalness={0.6} />
          </mesh>
        </>
      )
    case 'beacon':
      return (
        <>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 0.9, 10]} />
            <meshStandardMaterial color="#aab4c4" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <sphereGeometry args={[0.17, 20, 14]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.3} />
          </mesh>
        </>
      )
    case 'capsule':
      return (
        <mesh rotation={[0.35, 0, 0.2]}>
          <capsuleGeometry args={[0.26, 0.5, 6, 14]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.35} metalness={0.25} />
        </mesh>
      )
    case 'marker':
      return (
        <>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.2, 0.95, 0.2]} />
            <meshStandardMaterial color="#c9b8a8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.15, 18, 12]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.35} />
          </mesh>
        </>
      )
    case 'medallion':
      return (
        <>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.42, 0.08, 12, 44]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <sphereGeometry args={[0.17, 18, 12]} />
            <meshStandardMaterial color="#fff6d8" emissive={emissive} emissiveIntensity={0.35} roughness={0.4} />
          </mesh>
        </>
      )
    case 'cube':
      return (
        <mesh rotation={[0.3, 0, -0.25]}>
          <boxGeometry args={[0.52, 0.52, 0.52]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.3} metalness={0.3} />
        </mesh>
      )
    case 'scroll':
      return (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.19, 0.19, 0.72, 18, 1, true]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
      )
    case 'node':
    default:
      return (
        <mesh>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.25} metalness={0.35} />
        </mesh>
      )
  }
}
