'use client'

import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { QualitySettings } from '@/lib/quality'

/**
 * Postprocessing — the single most expensive thing in the scene, and the
 * first thing to go when frames get tight.
 *
 * Note there is no per-frame animation here on purpose. The flash as the
 * camera passes through the ring comes from the centrepiece spiking its own
 * `emissiveIntensity` (see Centrepiece.tsx) and bloom simply picking it up.
 * Driving the effect directly would be one more thing to keep in sync, and
 * it would look less physical.
 */

interface EffectsProps {
  settings: QualitySettings
}

export function Effects({ settings }: EffectsProps) {
  if (settings.postprocessing === 'off') return null

  const full = settings.postprocessing === 'full'

  return (
    <EffectComposer multisampling={full ? 4 : 0} enableNormalPass={false}>
      <Bloom
        intensity={full ? 0.85 : 0.55}
        // Only genuinely bright things bloom — a low threshold turns the whole
        // frame into soup and is the classic tell of an amateur WebGL scene.
        luminanceThreshold={0.72}
        luminanceSmoothing={0.35}
        mipmapBlur
        radius={0.72}
      />
      {full ? (
        <ChromaticAberration
          offset={new THREE.Vector2(0.0006, 0.0009)}
          radialModulation
          modulationOffset={0.4}
        />
      ) : (
        <></>
      )}
      {full ? <Vignette offset={0.28} darkness={0.72} eskil={false} /> : <></>}
    </EffectComposer>
  )
}
