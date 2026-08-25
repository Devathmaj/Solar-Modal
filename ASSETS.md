# Solar Portfolio - Asset Documentation

## Overview

This project uses Three.js to render a solar system with immersive planet-world views. All planet surface textures, atmosphere maps, and sky backgrounds use real spacecraft-derived imagery or NASA elevation data, replacing procedural canvas-generated textures with actual texture maps.

The terrain system uses procedurally-generated heightmaps based on real planetary elevation data characteristics (MESSENGER, Magellan, SRTM, CTX DTM, HiRISE) to create actual 3D terrain geometry with proper mesh displacement.

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

### Seamless Ground Surface Textures

Used for solid ground terrain (tiled on curved ground planes). Sourced from PolyHaven (CC0).

| Planet | Path | Source | License |
|--------|------|--------|---------|
| Mercury | `public/assets/planets/surface-textures/mercury_rock_ground_2k.jpg` | PolyHaven "rock_ground" | CC0 |
| Earth | `public/assets/planets/surface-textures/earth_ground_2k.jpg` | PolyHaven "sand_02" | CC0 |
| Mars | `public/assets/planets/surface-textures/mars_rocky_terrain_2k.jpg` | PolyHaven "rocky_terrain" | CC0 |

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

## Terrain System Architecture

The terrain system provides actual 3D geometry driven by elevation data, replacing the previous flat-texture approach.

### Terrain Data Sources

#### Mercury
- **Elevation**: USGS Astrogeology / NASA MESSENGER MLA (Mercury Laser Altimeter)
  - https://astrogeology.usgs.gov/
  - MLA: ~100m/pixel elevation resolution
- **Surface**: PolyHaven "rock_ground" (CC0), color-corrected for Mercury regolith
- **Terrain characteristics**: Airless, heavily cratered, sharp rims, no atmospheric scattering

#### Venus
- **Elevation**: NASA Magellan radar altimetry / USGS Astrogeology
  - https://astrogeology.usgs.gov/
  - Magellan: ~3km/pixel altimetry, ~100m/pixel SAR
- **Surface**: Solar System Scope / Magellan SAR mosaic (CC BY 4.0)
- **Terrain characteristics**: Volcanic plains, ridges, fractures, shield-volcano terrain

#### Earth
- **Elevation**: NASA SRTM / ASTER GDEM
  - https://earthdata.nasa.gov/
  - SRTM: 30m/pixel (1 arc-second)
- **Surface**: PolyHaven "sand_02" (CC0)
- **Terrain characteristics**: Varied tectonic terrain (mountains, valleys, plains)
- **Note**: System supports swapping geographic regions via terrainConfig.ts

#### Mars (Highest Detail)
- **Primary elevation**: USGS Astrogeology Mars CTX Digital Terrain Models (DTMs)
  - https://stac.astrogeology.usgs.gov/docs/data/mars/ctxdtms/
  - CTX DTM: ~6m/pixel elevation, ~24m elevation precision
- **High-detail local**: NASA/JPL HiRISE DTM products
  - https://hirise.lpl.arizona.edu/
  - HiRISE DTM: ~1m/pixel, ~0.25m elevation precision
- **Rover-scale**: NASA Planetary Data System (PDS)
  - https://pds.nasa.gov/
  - MER/Curiosity terrain characterization
- **Surface**: PolyHaven "rocky_terrain" (CC0), Mars-toned
- **Terrain characteristics**: Craters, dunes, rocky regolith, cliffs, dust/sand

### Terrain Components

| Component | Purpose |
|-----------|---------|
| `TerrainGrid` | Manages LOD tile loading based on camera distance |
| `TerrainTile` | Individual mesh tile with heightmap-driven vertex displacement |
| `RockScatter` | InstancedMesh rock scatter on terrain surface |
| `TerrainCracks` | Visual crack lines on terrain |
| `TerrainGrainOverlay` | Close-range sand/dust grain texture |

### LOD System

Each planet has 4-5 LOD levels with decreasing resolution at distance:

| Level | Load Distance | Tile Size | Segments |
|-------|---------------|-----------|----------|
| 0 (finest) | 15-20 | 60-80 | 128-160 |
| 1 | 40-60 | 120-160 | 96-128 |
| 2 | 100-150 | 240-320 | 64-96 |
| 3 | 250-400 | 480-600 | 48-64 |
| 4 (coarsest) | 600+ | 700+ | 48 |

### Metadata

Full attribution records for each terrain asset are stored in:
- `src/components/planet-worlds/terrain/terrainMetadata.ts`

## Immersive World Texture Usage

Each planet-world view now uses the terrain system for actual 3D ground geometry:

| World | Ground System | Sky Dome | Wall Texture |
|-------|--------------|----------|--------------|
| **Mercury** | TerrainGrid + RockScatter (MESSENGER elevation) | `stars_only_2k.jpg` (TextureSkyDome) | N/A |
| **Venus** | TerrainGrid below cloud layer (Magellan radar) | `2k_venus_surface.jpg` (TextureSkyDome) | `2k_venus_atmosphere.jpg` (GasWalls) |
| **Earth** | TerrainGrid + RockScatter (SRTM DEM) | Gradient sky (SkyDome) | N/A |
| **Mars** | TerrainGrid + RockScatter + TerrainCracks + GrainOverlay (CTX DTM) | Gradient sky (SkyDome) | N/A |
| **Sun** | N/A (no ground) | `2k_sun.jpg` (TextureSkyDome) | `2k_sun.jpg` (GasWalls) |
| **Jupiter** | N/A (gas giant) | N/A | Voyager 2 cylindrical (GasWalls) |
| **Saturn** | N/A (gas giant) | N/A | Cassini cylindrical (GasWalls) |
| **Uranus** | N/A (gas giant) | `2k_uranus.jpg` (TextureSkyDome) | N/A |
| **Neptune** | N/A (gas giant) | N/A | Voyager 2 cylindrical (GasWalls) |

## Transition System

The transition from global planetary sphere to local terrain uses a 4-phase cinematic:

1. **Enter**: Camera flies from solar system toward the live planet body
2. **Reveal**: Camera descends from elevated position to terrain anchor while overlay fades — the terrain materializes from above
3. **Exit Cover**: Overlay returns (leaving the body)
4. **Exit Pull**: Camera pulled away from body toward saved position

The terrain descent during reveal creates the visual effect of approaching the planetary surface from orbit.

## Rendering Components

### TerrainGrid
Quadtree-like tile manager that loads/unloads terrain tiles based on camera distance. Uses 4-5 LOD levels per planet with decreasing mesh resolution at distance.

### TerrainTile
Individual terrain mesh tile with heightmap-driven vertex displacement. Generates geometry from multi-octave noise, applies surface texture as albedo, and computes normals from heightmap gradient.

### RockScatter
GPU-instanced mesh scatter of small rocks sitting on the terrain surface. Uses InstancedMesh for single draw call per cluster.

### TextureSkyDome
Loads an equirectangular texture and maps it on the inside of a sphere (`BackSide` material). Replaces the procedural gradient shader for worlds using real texture backgrounds.

### GasWalls
Unchanged — continues to use real spacecraft cylindrical projections with enhancement passes (saturation, banding, grain) for immersive gas giant atmospheres.

## Build

`npm run build` completes successfully with all texture assets bundled in `dist/`.
