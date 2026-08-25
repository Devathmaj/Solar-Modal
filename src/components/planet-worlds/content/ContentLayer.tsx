import { Html } from '@react-three/drei'
import type { BodyId, WorldMeta } from '../../../config/planetWorlds'
import { BODY_CONTENT } from '../../../content/data'
import { useFocusSnapshot } from './contentFocus'
import { layoutItems } from './layout'
import { AmbientItem } from './AmbientItem'

/**
 * Everything content-related inside a world: the overview card at the anchor
 * plus the ring of ambient item artefacts. Focus state (set by clicking an
 * artefact) hides the overview card and lets WorldCameraRig glide to the item.
 */
export function ContentLayer({ bodyId, meta }: { bodyId: BodyId; meta: WorldMeta }) {
  const focus = useFocusSnapshot()
  const focused = focus.worldId === bodyId && Boolean(focus.itemId)
  const items = layoutItems(bodyId)
  const content = BODY_CONTENT[bodyId]

  return (
    <>
      {items.map((layout) => {
        const item = content.items.find((candidate) => candidate.id === layout.id)
        if (!item) return null
        return (
          <AmbientItem
            key={layout.id}
            bodyId={bodyId}
            item={item}
            position={layout.position}
          />
        )
      })}

      <Html position={meta.camera.anchor} center zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`world-card${focused ? ' world-card-hidden' : ''}`}>
          <span className="world-card-section">{meta.section}</span>
          <h1 className="world-card-title">{meta.title}</h1>
          <span className="world-card-intro">{content.intro}</span>
        </div>
      </Html>
    </>
  )
}
