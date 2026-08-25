# Solar Portfolio - Asset Documentation

## Overview

This project uses Three.js to render a solar system with immersive planet-world views. All planet surface textures, atmosphere maps, and sky backgrounds use real spacecraft-derived imagery or NASA elevation data, replacing procedural canvas-generated textures with actual texture maps.

## License Summary

All planetary texture maps are sourced from **Solar System Scope** and licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

- You may use, adapt, and share these textures for any purpose, even commercially.
- **Attribution required**: "Textures by Solar System Scope (https://www.solarsystemscope.com/textures/)"
- Based on NASA elevation and imagery data from Messenger, Viking, Cassini, and Hubble Space Telescope.

Real spacecraft cylindrical projection maps (Voyager 2, Cassini) are **public domain** as works of the U.S. federal government.

## Texture Assets

### Primary Planet Textures (2K Equirectangular)

Used for both solar system view (on 3D spheres) and immersive world views (on ground planes and sky domes).

| Body | Path | Source | License |
|------|------|--------|---------|
| Sun | `public/assets/planets/sun/2k_sun.jpg` | Solar System Scope / SDO | CC BY 4.0 |
| Mercury | `public/assets/planets/mercury/2k_mercury.jpg` | Solar System Scope / MESSENGER | CC BY 4.0 |
| Venus Atmosphere | `public/assets/planets/venus/2k_venus_atmosphere.jpg` | Solar System Scope / Magellan | CC BY 4.0 |
| Venus Surface | `public/assets/planets/venus/2k_venus_surface.jpg` | Solar System Scope / Magellan radar | CC BY 4.0 |
| Earth Day | `public/assets/planets/earth/2k_earth_daymap.jpg` | Solar System Scope / NASA Blue Marble | CC BY 4.0 |
| Mars | `public/assets/planets/mars/2k_mars.jpg` | Solar System Scope / Viking | CC BY 4.0 |
| Jupiter | `public/assets/planets/jupiter/2k_jupiter.jpg` | Solar System Scope / Voyager | CC BY 4.0 |
| Saturn | `public/assets/planets/saturn/2k_saturn.jpg` | Solar System Scope / Cassini | CC BY 4.0 |
| Saturn Rings | `public/assets/planets/saturn/2k_saturn_ring_alpha.png` | Solar System Scope / Cassini | CC BY 4.0 |
| Uranus | `public/assets/planets/uranus/2k_uranus.jpg` | Solar System Scope / Voyager 2 | CC BY 4.0 |
| Neptune | `public/assets/planets/neptune/2k_neptune.jpg` | Solar System Scope / Voyager 2 | CC BY 4.0 |
| Moon | `public/assets/planets/moon/2k_moon.jpg` | Solar System Scope / LRO | CC BY 4.0 |

### Real Spacecraft Cylindrical Projections

Used for immersive gas giant wall textures (wrapped on cylinders surrounding the camera).

| Body | Path | Source | License |
|------|------|--------|---------|
| Jupiter | `public/assets/planets/real-maps/jupiter_voyager2_cylindrical.jpg` | Voyager 2 mission | Public Domain |
| Saturn | `public/assets/planets/real-maps/saturn_cassini_cylindrical.jpg` | Cassini mission | Public Domain |
| Uranus | `public/assets/planets/real-maps/uranus_voyager2_cylindrical.png` | Voyager 2 mission | Public Domain |
| Neptune | `public/assets/planets/real-maps/neptune_voyager2_cylindrical.jpg` | Voyager 2 mission | Public Domain |

### Background/Celestial Textures

| Asset | Path | Source | License |
|-------|------|--------|---------|
| Milky Way | `public/assets/background/milkyway_gaia_edr3_4k.jpg` | Gaia EDR3 survey | CC BY 4.0 |
| Stars (with Milky Way) | `public/assets/background/stars_2k.jpg` | Solar System Scope | CC BY 4.0 |
| Stars (without Milky Way) | `public/assets/background/stars_only_2k.jpg` | Solar System Scope | CC BY 4.0 |

### Star Data (JSON)

| Asset | Path | Source | License |
|-------|------|--------|---------|
| Bright Stars | `public/assets/stars/hyg_bright_stars.json` | HYG v3.8 database | Public Domain |
| Landmark Stars | `public/assets/stars/star_landmarks.json` | Derived from HYG | Public Domain |

## Immersive World Texture Usage

Each planet-world view now uses real textures instead of procedurally generated canvas textures:

| World | Ground/Surface Texture | Sky Dome | Wall Texture |
|-------|----------------------|----------|--------------|
| **Mercury** | `2k_mercury.jpg` (TextureGround) | `stars_only_2k.jpg` (TextureSkyDome) | N/A |
| **Mars** | `2k_mars.jpg` (TextureGround) | Gradient sky (SkyDome) | N/A |
| **Earth** | `2k_earth_daymap.jpg` (TextureGround) | Gradient sky (SkyDome) | N/A |
| **Venus** | N/A (hidden surface) | `2k_venus_surface.jpg` (TextureSkyDome) | `2k_venus_atmosphere.jpg` (GasWalls) |
| **Sun** | N/A (no ground) | `2k_sun.jpg` (TextureSkyDome) | `2k_sun.jpg` (GasWalls) |
| **Jupiter** | N/A (gas giant) | Procedural banded gas sky (GasSkyDome) | Voyager 2 cylindrical (GasWalls) |
| **Saturn** | N/A (gas giant) | Procedural banded gas sky (GasSkyDome) | Cassini cylindrical (GasWalls) |
| **Uranus** | N/A (gas giant) | Procedural banded gas sky (GasSkyDome) | Voyager 2 cylindrical (GasWalls) |
| **Neptune** | N/A (gas giant) | Procedural banded gas sky (GasSkyDome) | Voyager 2 cylindrical (GasWalls) |

## Rendering Components

### TextureGround
Loads an equirectangular planet texture and maps it onto a curved `PlaneGeometry` with vertex displacement, curvature simulation, and optional crater carving. Replaces the procedural `RockyGround` for worlds using real textures.

### TextureSkyDome
Loads an equirectangular texture and maps it on the inside of a sphere (`BackSide` material). Replaces the procedural `GasSkyDome` and `SkyDome` gradient shaders for worlds using real texture backgrounds.

### GasWalls
Unchanged — continues to use real spacecraft cylindrical projections with enhancement passes (saturation, banding, grain) for immersive gas giant atmospheres.

## Build

`npm run build` completes successfully with all texture assets bundled in `dist/`.
