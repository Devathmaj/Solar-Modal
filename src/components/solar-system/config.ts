import { PLANET_TEXTURES } from './textures'

export interface PlanetConfig {
  name: string
  texture: string
  radius: number
  orbitRadius: number
  revolutionSpeed: number
  rotationSpeed: number
  axialTilt: number
  initialAngle: number
}

export const PLANET_CONFIGS: PlanetConfig[] = [
  {
    name: 'Mercury',
    texture: PLANET_TEXTURES.mercury,
    radius: 0.9,
    orbitRadius: 14,
    revolutionSpeed: 0.08,
    rotationSpeed: 0.01,
    axialTilt: 0.03,
    initialAngle: -25,
  },
  {
    name: 'Venus',
    texture: PLANET_TEXTURES.venus,
    radius: 1.7,
    orbitRadius: 19,
    revolutionSpeed: 0.058,
    rotationSpeed: -0.02,
    axialTilt: 2.6,
    initialAngle: -160,
  },
  {
    name: 'Earth',
    texture: PLANET_TEXTURES.earth,
    radius: 1.8,
    orbitRadius: 25,
    revolutionSpeed: 0.045,
    rotationSpeed: 0.15,
    axialTilt: 23.4,
    initialAngle: -5,
  },
  {
    name: 'Mars',
    texture: PLANET_TEXTURES.mars,
    radius: 1.3,
    orbitRadius: 31,
    revolutionSpeed: 0.036,
    rotationSpeed: 0.14,
    axialTilt: 25.2,
    initialAngle: 185,
  },
  {
    name: 'Jupiter',
    texture: PLANET_TEXTURES.jupiter,
    radius: 5.2,
    orbitRadius: 45,
    revolutionSpeed: 0.02,
    rotationSpeed: 0.25,
    axialTilt: 3.1,
    initialAngle: 160,
  },
  {
    name: 'Uranus',
    texture: PLANET_TEXTURES.uranus,
    radius: 2.6,
    orbitRadius: 76,
    revolutionSpeed: 0.009,
    rotationSpeed: 0.12,
    axialTilt: 97.8,
    initialAngle: 145,
  },
  {
    name: 'Neptune',
    texture: PLANET_TEXTURES.neptune,
    radius: 2.5,
    orbitRadius: 84,
    revolutionSpeed: 0.006,
    rotationSpeed: 0.13,
    axialTilt: 28.3,
    initialAngle: 55,
  },
]

export const SATURN_CONFIG: PlanetConfig = {
  name: 'Saturn',
  texture: PLANET_TEXTURES.saturn,
  radius: 4.4,
  orbitRadius: 62,
  revolutionSpeed: 0.014,
  rotationSpeed: 0.22,
  axialTilt: 26.73,
  initialAngle: 30,
}
