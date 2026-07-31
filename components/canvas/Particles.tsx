'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, spanProgress, smoothstep, damp } from '@/lib/scrollStore'

/**
 * Marigold motes → starfield.
 *
 * One buffer, two sets of positions, and a single `uMix` uniform. The morph
 * happens entirely on the GPU: no per-frame JavaScript touches the 20 000
 * vertices, so this costs the same on a laptop as it does on a phone (only
 * the count changes with the quality tier).
 *
 * State A — petals: a loose shell hanging around the centrepiece, the way
 *   marigold garlands catch the light at a Rajasthani mandap.
 * State B — stars: dispersed down the whole corridor, so the timeline and
 *   gallery scenes are travelling through something rather than through void.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMix;
  uniform float uSize;
  uniform float uVelocity;

  attribute vec3 aTarget;
  attribute float aScale;
  attribute float aSeed;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 pos = mix(position, aTarget, uMix);

    // Individual drift so no two motes ever move together.
    float t = uTime * 0.25 + aSeed * 6.2831853;
    pos.x += sin(t) * 0.34;
    pos.y += cos(t * 0.83) * 0.34 + sin(uTime * 0.11 + aSeed * 9.7) * 0.22;
    pos.z += cos(t * 0.61) * 0.34;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float dist = -mv.z;
    // Perspective-correct sizing, inflated slightly by scroll speed so a fast
    // flick streaks the field.
    gl_PointSize = uSize * aScale * (1.0 + uVelocity * 2.2) * (32.0 / max(dist, 0.6));

    // Fade in from the near plane and out into the fog — nothing should pop.
    vAlpha = smoothstep(0.4, 3.0, dist) * (1.0 - smoothstep(38.0, 62.0, dist));
    vSeed = aSeed;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorStar;
  uniform float uMix;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft round falloff — a hard disc would read as dirt on the lens.
    float falloff = pow(1.0 - d * 2.0, 2.2);

    vec3 color = mix(uColorA, uColorB, vSeed);
    color = mix(color, uColorStar, uMix * 0.55);

    gl_FragColor = vec4(color, falloff * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`

interface ParticlesProps {
  count: number
}

export function Particles({ count }: ParticlesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const smoothVelocity = useRef(0)

  const { positions, targets, scales, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const targets = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // ── State A: a shell around the centrepiece ──────────────────────────
      // Sampled on a sphere so the density reads evenly from every angle.
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 3.2 + Math.pow(Math.random(), 0.6) * 7.5
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.75
      positions[i3 + 2] = radius * Math.cos(phi)

      // ── State B: dispersed down the corridor ────────────────────────────
      targets[i3] = (Math.random() - 0.5) * 44
      targets[i3 + 1] = (Math.random() - 0.5) * 26
      targets[i3 + 2] = 8 - Math.random() * 52

      scales[i] = 0.4 + Math.pow(Math.random(), 2) * 1.9
      seeds[i] = Math.random()
    }

    return { positions, targets, scales, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMix: { value: 0 },
      uSize: { value: 3.2 },
      uVelocity: { value: 0 },
      uOpacity: { value: 0 },
      uColorA: { value: new THREE.Color('#E8A33D') }, // marigold
      uColorB: { value: new THREE.Color('#EFD9A8') }, // champagne
      uColorStar: { value: new THREE.Color('#BBD0F0') }, // cool starlight
    }),
    [],
  )

  useFrame((state, dt) => {
    const material = materialRef.current
    if (!material) return
    const d = Math.min(dt, 0.1)

    material.uniforms.uTime.value = state.clock.elapsedTime

    // Petals disperse into stars across the "through → timeline" stretch.
    material.uniforms.uMix.value = smoothstep(spanProgress('through', 'timeline'))

    // Fade the whole field up after the hero so the opening frame stays clean.
    material.uniforms.uOpacity.value = damp(
      material.uniforms.uOpacity.value,
      0.35 + smoothstep(spanProgress('hero', 'twoWorlds', 1, 0)) * 0.65,
      2.5,
      d,
    )

    smoothVelocity.current = damp(smoothVelocity.current, Math.abs(scroll.velocity), 6, d)
    material.uniforms.uVelocity.value = Math.min(smoothVelocity.current, 1.5)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
