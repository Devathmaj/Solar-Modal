import { Html } from '@react-three/drei'
import type { WorldMeta } from '../../config/planetWorlds'

/**
 * Minimal in-world placeholder proving portfolio content can live at a
 * specific location inside each planet world. The visual environment and the
 * content architecture are deliberately kept separate.
 */
export function PortfolioContent({ meta }: { meta: WorldMeta }) {
  return (
    <Html
      position={meta.camera.anchor}
      center
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className="world-card">
        <span className="world-card-section">{meta.section}</span>
        <h1 className="world-card-title">{meta.title}</h1>
        <span className="world-card-hint">Portfolio content will take shape here</span>
      </div>
    </Html>
  )
}
