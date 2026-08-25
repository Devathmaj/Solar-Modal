import { BODY_CONTENT } from '../../../content/data'
import type { ItemKind } from '../../../content/types'
import type { BodyId } from '../../../config/planetWorlds'

/** Per-body ring placement for the ambient item circle around the anchor. */
const RING: Record<BodyId, { ringRadius: number; y: number }> = {
  sun: { ringRadius: 3.1, y: 1.5 },
  mercury: { ringRadius: 3.2, y: 1.7 },
  venus: { ringRadius: 3.2, y: 1.6 },
  earth: { ringRadius: 3.5, y: 1.9 },
  mars: { ringRadius: 3.4, y: 1.7 },
  jupiter: { ringRadius: 3.0, y: 1.8 },
  saturn: { ringRadius: 3.1, y: 1.6 },
  uranus: { ringRadius: 3.0, y: 1.6 },
  neptune: { ringRadius: 3.0, y: 1.6 },
}

export interface ItemLayout {
  id: string
  kind: ItemKind
  angle: number
  position: [number, number, number]
}

export function layoutItems(bodyId: BodyId): ItemLayout[] {
  const items = BODY_CONTENT[bodyId].items
  const { ringRadius, y } = RING[bodyId]
  return items.map((item, index) => {
    const angle = (index / items.length) * Math.PI * 2 + 0.65
    return {
      id: item.id,
      kind: item.kind,
      angle,
      position: [Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius],
    }
  })
}

export function itemPosition(bodyId: BodyId, itemId: string): [number, number, number] | null {
  const found = layoutItems(bodyId).find((layout) => layout.id === itemId)
  return found ? found.position : null
}

export const KIND_COLORS: Record<ItemKind, string> = {
  pod: '#6fb3ff',
  beacon: '#ffd166',
  capsule: '#f4a261',
  marker: '#ff8a5c',
  node: '#b388ff',
  medallion: '#ffd700',
  cube: '#7bdff2',
  scroll: '#9dffe0',
}
