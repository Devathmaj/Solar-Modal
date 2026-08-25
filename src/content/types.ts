import type { BodyId } from '../config/planetWorlds'

/** Ambient 3D representation used for an item inside its world. */
export type ItemKind =
  | 'pod' // project pods (Earth)
  | 'beacon' // comms channels (Mercury) / gateways (Sun)
  | 'capsule' // message capsules (Venus)
  | 'marker' // mission-log posts (Mars)
  | 'node' // skill nodes (Jupiter)
  | 'medallion' // badges (Saturn)
  | 'cube' // experiments (Uranus)
  | 'scroll' // articles (Neptune)

export interface ContentLink {
  label: string
  href: string
}

export interface ContentItem {
  id: string
  kind: ItemKind
  title: string
  /** Role, organisation, category — the secondary line. */
  subtitle?: string
  /** Date-range / meta chip. */
  period?: string
  tags?: string[]
  description: string[]
  link?: ContentLink
}

export interface BodyContent {
  /** One-liner shown on the world's overview card. */
  intro: string
  items: ContentItem[]
}

export type AllBodyContent = Record<BodyId, BodyContent>
