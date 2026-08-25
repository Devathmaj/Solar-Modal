import * as THREE from 'three'

export const PLANET_TEXTURES = {
  sun: '/assets/planets/sun/2k_sun.jpg',
  mercury: '/assets/planets/mercury/2k_mercury.jpg',
  venus: '/assets/planets/venus/2k_venus_atmosphere.jpg',
  earth: '/assets/planets/earth/2k_earth_daymap.jpg',
  mars: '/assets/planets/mars/2k_mars.jpg',
  jupiter: '/assets/planets/jupiter/2k_jupiter.jpg',
  saturn: '/assets/planets/saturn/2k_saturn.jpg',
  saturnRings: '/assets/planets/saturn/2k_saturn_ring_alpha.png',
  uranus: '/assets/planets/uranus/2k_uranus.jpg',
  neptune: '/assets/planets/neptune/2k_neptune.jpg',
  moon: '/assets/planets/moon/2k_moon.jpg',
}

/**
 * Maximum quality texture configuration for Three.js.
 * These settings should be applied when loading textures via useHighQualityTexture().
 * 
 * Key settings for best 2D texture quality:
 * - anisotropy: 16 (max for most GPUs) - sharpens texture detail
 * - magFilter: Linear - better magnification
 * - minFilter: LinearMipmapLinearFilter - best LOD transition
 * - generateMipmaps: true - enables MIPMAP for distant views
 * - anisotropy must be set AFTER mipmap generation in some cases
 * - wrapS/wrapT: ClampToEdgeWrapping prevents edge artifacts
 * - needsUpdate: true forces immediate upload to GPU
 */
export const TEXTURE_QUALITY_SETTINGS = {
  anisotropy: 16,
  magFilter: THREE.LinearFilter,
  minFilter: THREE.LinearMipmapLinearFilter,
  generateMipmaps: true,
  wrapS: THREE.ClampToEdgeWrapping,
  wrapT: THREE.ClampToEdgeWrapping,
  needsUpdate: true,
}

/**
 * Enhancement options per-body for GasWalls real-map pass.
 * These are applied via enhanceAtmosphereImage in WorldEnvironment.tsx.
 * Settings deliberately push readability while keeping the underlying spacecraft
 * map's large-scale features. NOTE: These are code-based enhancement options.
 * For pure asset-based quality, use the TEXTURE_QUALITY_SETTINGS above instead.
 */
export const PLANET_ENHANCE = {
  sun:      { saturation: 1.35, contrast: 1.22, brightness: 1.06, bandStrength: 0.45, grain: 0.45 },
  mercury:  { saturation: 1,   contrast: 1.1,  brightness: 1.05, bandStrength: 0,    grain: 0.2 },
  venus:    { saturation: 1.2, contrast: 1.3,  brightness: 1.08, bandStrength: 0.3,  grain: 0.3 },
  earth:    { saturation: 1.1, contrast: 1.2,  brightness: 1.04, bandStrength: 0.2,  grain: 0.2 },
  mars:     { saturation: 1.15, contrast: 1.25, brightness: 1.07, bandStrength: 0.1,  grain: 0.15 },
  jupiter:  undefined as undefined,
  saturn:   { saturation: 1.1, contrast: 1.15, brightness: 1.04, bandStrength: 0.15, grain: 0.15 },
  uranus:   undefined as undefined,
  neptune:  { saturation: 1.2, contrast: 1.2, brightness: 1.04, bandStrength: 0.2, grain: 0.2 },
  moon:     { saturation: 1,   contrast: 1.1,  brightness: 1.05, bandStrength: 0,    grain: 0.1 },
}