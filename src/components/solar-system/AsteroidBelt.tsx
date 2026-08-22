import { DebrisField } from './DebrisField'
import { MARS_ORBIT_RADIUS, JUPITER_ORBIT_RADIUS } from './config'

const BELT_INNER_GAP = 3
const BELT_OUTER_GAP = 5.5

export function AsteroidBelt() {
  return (
    <DebrisField
      innerRadius={MARS_ORBIT_RADIUS + BELT_INNER_GAP}
      outerRadius={JUPITER_ORBIT_RADIUS - BELT_OUTER_GAP}
      instancesPerGroup={[400, 400, 300]}
      verticalThickness={1.4}
      minScale={0.07}
      maxScale={0.42}
      keplerConstant={5.9}
      speedJitter={0.15}
      color="#918b7f"
      geometryDetail={1}
    />
  )
}
