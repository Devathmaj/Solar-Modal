import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type BodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'

export interface WorldCameraConfig {
  /** Point the world camera orbits; usually the content anchor. */
  anchor: [number, number, number]
  distance: number
  minDistance: number
  maxDistance: number
  minPitch: number
  maxPitch: number
  initialYaw?: number
  initialPitch?: number
  /** Amplitude of the gentle idle drift (world-specific "alive" feel). */
  drift?: number
}

export interface WorldMeta {
  id: BodyId
  title: string
  /** Portfolio section this destination opens into (next phase). */
  section: string
  /** Overlay colour that envelops the camera while entering/leaving. */
  fadeColor: string
  /** Optional exponential fog applied inside the world. */
  fog?: [color: string, density: number]
  camera: WorldCameraConfig
}

/**
 * Central mapping between solar-system bodies and their worlds.
 * The planet meshes never hardcode routing — they resolve their BodyId here.
 */
const PLANET_NAME_TO_BODY: Record<string, BodyId> = {
  Mercury: 'mercury',
  Venus: 'venus',
  Earth: 'earth',
  Mars: 'mars',
  Jupiter: 'jupiter',
  Saturn: 'saturn',
  Uranus: 'uranus',
  Neptune: 'neptune',
}

export function bodyIdForPlanetName(name: string): BodyId | null {
  return PLANET_NAME_TO_BODY[name] ?? null
}

export const WORLDS: Record<BodyId, WorldMeta> = {
  sun: {
    id: 'sun',
    title: 'SUN',
    section: 'Overview',
    fadeColor: '#ffbf6e',
    fog: ['#ff8c30', 0.028],
    camera: {
      anchor: [0, 1.4, -5],
      distance: 8,
      minDistance: 4,
      maxDistance: 14,
      minPitch: -0.35,
      maxPitch: 0.55,
      drift: 0.16,
    },
  },
  mercury: {
    id: 'mercury',
    title: 'MERCURY',
    section: 'Contact',
    fadeColor: '#b3aba1',
    fog: ['#403b35', 0.007],
    camera: {
      anchor: [0, 1.6, -6],
      distance: 8.5,
      minDistance: 4,
      maxDistance: 15,
      minPitch: -0.12,
      maxPitch: 0.62,
      drift: 0.05,
    },
  },
  venus: {
    id: 'venus',
    title: 'VENUS',
    section: 'Testimonials',
    fadeColor: '#dba750',
    fog: ['#c08a3e', 0.05],
    camera: {
      anchor: [0, 1.5, -5.5],
      distance: 7.5,
      minDistance: 3.5,
      maxDistance: 13,
      minPitch: -0.3,
      maxPitch: 0.5,
      drift: 0.12,
    },
  },
  earth: {
    id: 'earth',
    title: 'EARTH',
    section: 'Projects',
    fadeColor: '#bdd8f4',
    fog: ['#a8c8e8', 0.009],
    camera: {
      anchor: [0, 1.7, -6],
      distance: 9,
      minDistance: 4,
      maxDistance: 16,
      minPitch: -0.18,
      maxPitch: 0.55,
      drift: 0.07,
    },
  },
  mars: {
    id: 'mars',
    title: 'MARS',
    section: 'Experience',
    fadeColor: '#cb8c60',
    fog: ['#a86a42', 0.02],
    camera: {
      anchor: [0, 1.5, -6],
      distance: 8.5,
      minDistance: 4,
      maxDistance: 15,
      minPitch: -0.15,
      maxPitch: 0.58,
      drift: 0.06,
    },
  },
  jupiter: {
    id: 'jupiter',
    title: 'JUPITER',
    section: 'Skills',
    fadeColor: '#c69d6d',
    fog: ['#7a4e28', 0.03],
    camera: {
      anchor: [0, 1.6, -5],
      distance: 7,
      minDistance: 3,
      maxDistance: 12,
      minPitch: -0.42,
      maxPitch: 0.42,
      drift: 0.2,
    },
  },
  saturn: {
    id: 'saturn',
    title: 'SATURN',
    section: 'Certifications',
    fadeColor: '#dbc497',
    fog: ['#a8895c', 0.026],
    camera: {
      anchor: [0, 1.5, -5],
      distance: 7,
      minDistance: 3,
      maxDistance: 12,
      minPitch: -0.38,
      maxPitch: 0.45,
      drift: 0.16,
    },
  },
  uranus: {
    id: 'uranus',
    title: 'URANUS',
    section: 'Playground',
    fadeColor: '#a8dcdf',
    fog: ['#6fa9ad', 0.03],
    camera: {
      anchor: [0, 1.4, -5],
      distance: 6.5,
      minDistance: 3,
      maxDistance: 11,
      minPitch: -0.35,
      maxPitch: 0.45,
      drift: 0.14,
    },
  },
  neptune: {
    id: 'neptune',
    title: 'NEPTUNE',
    section: 'Writing',
    fadeColor: '#5484d4',
    fog: ['#2f55a5', 0.032],
    camera: {
      anchor: [0, 1.4, -5],
      distance: 6.5,
      minDistance: 3,
      maxDistance: 11,
      minPitch: -0.4,
      maxPitch: 0.45,
      drift: 0.18,
    },
  },
}

/**
 * Lazy-loaded so only the visited world's chunk (and its cost) is fetched —
 * the Solar System page stays fast.
 */
export const WORLD_COMPONENTS: Record<BodyId, LazyExoticComponent<ComponentType>> = {
  sun: lazy(() => import('../components/planet-worlds/SunWorld')),
  mercury: lazy(() => import('../components/planet-worlds/MercuryWorld')),
  venus: lazy(() => import('../components/planet-worlds/VenusWorld')),
  earth: lazy(() => import('../components/planet-worlds/EarthWorld')),
  mars: lazy(() => import('../components/planet-worlds/MarsWorld')),
  jupiter: lazy(() => import('../components/planet-worlds/JupiterWorld')),
  saturn: lazy(() => import('../components/planet-worlds/SaturnWorld')),
  uranus: lazy(() => import('../components/planet-worlds/UranusWorld')),
  neptune: lazy(() => import('../components/planet-worlds/NeptuneWorld')),
}
