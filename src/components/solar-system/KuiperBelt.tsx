import { DebrisField } from './DebrisField'
import { NEPTUNE_ORBIT_RADIUS } from './config'

const KUIPER_INNER_RATIO = 1.12
const KUIPER_OUTER_RATIO = 1.55

export function KuiperBelt() {
  return (
    <DebrisField
      innerRadius={NEPTUNE_ORBIT_RADIUS * KUIPER_INNER_RATIO}
      outerRadius={NEPTUNE_ORBIT_RADIUS * KUIPER_OUTER_RATIO}
      instancesPerGroup={[350, 250]}
      verticalThickness={3.2}
      minScale={0.06}
      maxScale={0.26}
      keplerConstant={5.9}
      speedJitter={0.2}
      color="#a7b6c2"
      geometryDetail={0}
    />
  )
}
