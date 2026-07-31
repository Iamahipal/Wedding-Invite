'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { scroll, sceneProgress, smoothstep } from '@/lib/scrollStore'

/**
 * The reflection studio.
 *
 * There are no shadow maps anywhere in this scene — and there shouldn't be.
 * A polished metal object reads as "expensive" because of what it *reflects*,
 * not what it occludes. So we build a small studio of Lightformers, bake it
 * into an environment map exactly once (`frames={1}`), and get gorgeous
 * anisotropic highlights for roughly the cost of nothing.
 *
 * The indigo → champagne warmth shift across the journey is done by animating
 * two cheap real lights and the fog, never by re-rendering the env map.
 */

const COOL = new THREE.Color('#2B4C7E')
const WARM = new THREE.Color('#E8A33D')
const CHAMPAGNE = new THREE.Color('#EFD9A8')

interface LightingProps {
  resolution: number
}

export function Lighting({ resolution }: LightingProps) {
  const keyRef = useRef<THREE.PointLight>(null)
  const rimRef = useRef<THREE.PointLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const fogColor = useRef(new THREE.Color('#0A0E1A'))
  const scratch = useRef(new THREE.Color())

  useFrame(({ scene, clock }) => {
    const p = scroll.smooth
    const t = clock.elapsedTime

    // 0 → 1 warmth, ramping through the ring pass and holding warm afterwards.
    const warmth = smoothstep(sceneProgress('approach') * 0.5 + sceneProgress('through') * 0.5)

    if (keyRef.current) {
      scratch.current.copy(COOL).lerp(WARM, warmth)
      keyRef.current.color.copy(scratch.current)
      // Intensity blooms as we approach the knot, then settles.
      keyRef.current.intensity = 18 + smoothstep(sceneProgress('approach')) * 42
      // A slow orbit keeps the metal alive even when the page is still.
      keyRef.current.position.x = Math.sin(t * 0.18) * 5
      keyRef.current.position.z = 3 + Math.cos(t * 0.18) * 3
    }

    if (rimRef.current) {
      scratch.current.copy(CHAMPAGNE).lerp(WARM, warmth * 0.6)
      rimRef.current.color.copy(scratch.current)
      rimRef.current.intensity = 12 + Math.sin(t * 0.4) * 3
    }

    if (ambientRef.current) {
      // Brighten a touch in the timeline/particle stretch so the field reads.
      ambientRef.current.intensity = 0.35 + sceneProgress('timeline') * 0.5
    }

    // Fog does two jobs: it hides the far end of the corridor, and it is how
    // the "environment warms up" actually lands on screen.
    if (scene.fog instanceof THREE.Fog) {
      fogColor.current.set('#0A0E1A').lerp(new THREE.Color('#1A1424'), warmth)
      scene.fog.color.copy(fogColor.current)
      // Push the fog back as we travel so distant scenes aren't swallowed.
      scene.fog.near = 8 + p * 10
      scene.fog.far = 45 + p * 40
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.35} color="#8FA5C9" />

      <pointLight ref={keyRef} position={[3, 2, 3]} intensity={18} color={COOL} distance={40} decay={1.6} />
      <pointLight ref={rimRef} position={[-4, -1, -3]} intensity={12} color={CHAMPAGNE} distance={40} decay={1.6} />

      {/* A cool counter-light keeps the shadow side from going muddy black. */}
      <pointLight position={[0, 6, -12]} intensity={9} color="#4A72AD" distance={50} decay={1.8} />

      {/*
        Baked once. Lightformers are just emissive planes rendered into a
        cubemap — this is the whole reason the gold looks like gold.
      */}
      <Environment resolution={resolution} frames={1}>
        {/* Broad soft key from above — the main sheen band. */}
        <Lightformer
          form="rect"
          intensity={4}
          color="#EFD9A8"
          position={[0, 5, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 6, 1]}
        />
        {/* Two narrow strip lights give metal its signature streaked highlight. */}
        <Lightformer
          form="rect"
          intensity={6}
          color="#FFD9A0"
          position={[-5, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 1.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={5}
          color="#C98B7A"
          position={[5, -1, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[10, 1, 1]}
        />
        {/* Cool fill from behind — this is where the Jodhpur blue enters. */}
        <Lightformer
          form="circle"
          intensity={3}
          color="#2B4C7E"
          position={[0, -3, -6]}
          scale={[8, 8, 1]}
        />
        {/* Warm marigold glow low and forward. */}
        <Lightformer
          form="circle"
          intensity={2.5}
          color="#E8A33D"
          position={[2, -4, 4]}
          scale={[6, 6, 1]}
        />
      </Environment>
    </>
  )
}
