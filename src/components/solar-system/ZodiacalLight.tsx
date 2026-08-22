import { useMemo } from 'react'
import * as THREE from 'three'

// Real phenomenon: sunlight scattered by interplanetary dust concentrated in
// the ecliptic plane (zodiacal light). Rendered as a faint additive annulus
// around the Sun with exponential radial decay; intensity kept very low.
const INNER_RADIUS = 9
const OUTER_RADIUS = 82
const PEAK_INTENSITY = 0.4

const vertexShader = /* glsl */ `
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uIntensity;
  varying vec2 vLocal;
  void main() {
    float distance = length(vLocal);
    float t = clamp((distance - uInnerRadius) / (uOuterRadius - uInnerRadius), 0.0, 1.0);
    float falloff = exp(-t * 3.2) * smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.75, 1.0, t));
    float alpha = falloff * uIntensity;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`

export function ZodiacalLight() {
  const geometry = useMemo(() => new THREE.RingGeometry(INNER_RADIUS, OUTER_RADIUS, 128, 1), [])
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#f5e3c3') },
      uInnerRadius: { value: INNER_RADIUS },
      uOuterRadius: { value: OUTER_RADIUS },
      uIntensity: { value: PEAK_INTENSITY },
    }),
    [],
  )

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
