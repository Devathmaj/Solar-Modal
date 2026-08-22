# Assets & Data Sources

This project mixes **real astronomical data/assets** with **procedurally generated content**.
Every fetched asset or dataset is listed below with its origin, license, processing, and usage.
When a new asset or data source is added to the project, append an entry here.

---

## 1. Planetary & lunar surface textures

| | |
|---|---|
| **Source** | [Solar System Scope — Textures](https://www.solarsystemscope.com/textures/) |
| **License** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **Files** (under `public/assets/planets/`) | `sun/2k_sun.jpg`, `mercury/2k_mercury.jpg`, `venus/2k_venus_atmosphere.jpg`, `earth/2k_earth_daymap.jpg`, `mars/2k_mars.jpg`, `jupiter/2k_jupiter.jpg`, `saturn/2k_saturn.jpg`, `saturn/2k_saturn_ring_alpha.png`, `uranus/2k_uranus.jpg`, `neptune/2k_neptune.jpg`, `moon/2k_moon.jpg` |
| **Processing** | None (used as downloaded) |
| **Used by** | `Sun.tsx`, `Planet.tsx` (all planets), `Saturn.tsx` (rings), `EarthMoon.tsx` |

Upgrade path: higher-resolution (4K/8K) versions of the same maps are drop-in
replacements — swap the paths in `src/components/solar-system/textures.ts`.

---

## 2. Starfield catalog (HYG database)

| | |
|---|---|
| **Source** | [astronexus/HYG-Database](https://github.com/astronexus/HYG-Database), file `hyg/v3/hyg_v38.csv.gz` — merge of the Hipparcos, Yale Bright Star and Gliese catalogs |
| **License** | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/) |
| **Filtering** | Apparent magnitude ≤ 7.5 anywhere, plus stars down to magnitude 8.5 within ±10° of the galactic plane (Milky Way band); Sun excluded. RA converted from catalog hours to degrees; galactic latitude derived via the IAU J2000 north galactic pole transformation (α=192.85948°, δ=27.12825°). |
| **Output** | `public/assets/stars/hyg_bright_stars.json` — 34,269 rows of `[raDeg, decDeg, mag, B-V, distPc, galacticLatDeg]` (~1.16 MB) |
| **Used by** | `src/components/solar-system/Starfield.tsx` |

Notes: catalog parallax distances drive the depth shells (logarithmic mapping
onto display radii 340–1150); stars without distance data are placed on the
outermost shell as a documented visualization choice.

---

## 3. Bright-star landmarks

| | |
|---|---|
| **Source** | Same HYG v3.8 catalog as above (positions/magnitudes verbatim) |
| **Selection** | 19 curated named stars: Sirius, Canopus, Alpha Centauri (HIP 71683), Arcturus, Vega, Capella, Rigel, Betelgeuse, Procyon, Achernar, Altair, Aldebaran, Antares, Spica, Pollux, Fomalhaut, Deneb, Regulus, Polaris |
| **License** | CC BY-SA 2.5 |
| **Output** | `public/assets/stars/star_landmarks.json` (`name`, `raDeg`, `decDeg`, `mag`, `bv`, `distPc`) |
| **Used by** | `Starfield.tsx` (rendering); the `name` field is reserved for a future label phase |

---

## 4. Milky Way all-sky background

| | |
|---|---|
| **Source** | ESA/Gaia/DPAC — ["The colour of the sky from Gaia's Early Data Release 3"](https://www.esa.int/ESA_Multimedia/Images/2020/12/The_colour_of_the_sky_from_Gaia_s_Early_Data_Release_32), equirectangular variant. Acknowledgement: A. Moitinho. Represents measured brightness/colour of ~1.8 billion Gaia stars. |
| **License** | [CC BY-SA 3.0 IGO](https://creativecommons.org/licenses/by-sa/3.0/igo/) |
| **File** | `public/assets/background/milkyway_gaia_edr3_4k.jpg` |
| **Processing** | Resized 4000×2000 PNG → 4096×2048 JPEG (quality 82); desaturated to 35% chroma (luminance-preserving) for visual subtlety |
| **Orientation** | The map is in galactic coordinates. Each texel is placed at its true equatorial direction using the IAU J2000 galactic frame (galactic centre RA=266.405° Dec=−28.93617°; north galactic pole RA=192.85948° Dec=+27.12825°). No artistic rotation. See `MilkyWay.tsx`. |
| **Used by** | `src/components/solar-system/MilkyWay.tsx` |

---

## 5. Procedural content (no external source)

Generated in code; nothing was downloaded for these:

- **Asteroid belt / Kuiper belt** — instanced noise-displaced icosahedra with
  Keplerian differential speeds (`DebrisField.tsx`; bounds derived from
  `config.ts`: Mars/Jupiter gap and 1.12–1.55× Neptune respectively)
- **Orbital paths** — procedural line loops (`Planet.tsx`)
- **Zodiacal light** — custom-shader annulus along the ecliptic representing
  sunlight scattered by interplanetary dust (`ZodiacalLight.tsx`)
- **Sun corona / star sprites** — canvas-generated radial gradient textures
  (`glowTexture.ts`)
- **Galilean & Saturnian moons** — procedurally shaded spheres with real size
  ordering, period ordering and albedo-inspired tints; distances compressed
  versus reality to fit scene layout (`GalileanMoons.tsx`, `SaturnMoons.tsx`,
  `EarthMoon.tsx` uses a real texture per §1)

---

## Attribution quick-reference

```
Planet textures:      Solar System Scope            CC BY 4.0
Star catalog:         HYG v3.8 / astronexus         CC BY-SA 2.5
Milky Way background: ESA/Gaia/DPAC (A. Moitinho)   CC BY-SA 3.0 IGO
```
