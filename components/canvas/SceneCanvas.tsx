'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { detectTier, getSettings, hasWebGL, prefersReducedMotion, type QualityTier } from '@/lib/quality'
import { useUiStore } from '@/lib/uiStore'
import { Experience } from './Experience'

/**
 * The fixed background canvas.
 *
 * Sits behind everything at `z-0` with `pointer-events: none` — the guest is
 * always scrolling and clicking the HTML above it, never the canvas itself.
 * That one detail is why the page still feels like a website rather than a
 * WebGL demo you have to fight.
 */

const TIER_ORDER: QualityTier[] = ['low', 'mid', 'high']

/** Shown when WebGL is unavailable, or when the guest asked for less motion. */
function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 22%, #2B4C7E22 0%, transparent 55%),' +
          'radial-gradient(90% 60% at 50% 40%, #D4A85733 0%, transparent 60%),' +
          'radial-gradient(140% 100% at 50% 100%, #131B33 0%, #0A0E1A 70%)',
      }}
    />
  )
}

export function SceneCanvas() {
  const tier = useUiStore((state) => state.tier)
  const setTier = useUiStore((state) => state.setTier)
  const setReady = useUiStore((state) => state.setReady)
  const reducedMotion = useUiStore((state) => state.reducedMotion)
  const setReducedMotion = useUiStore((state) => state.setReducedMotion)

  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [visible, setVisible] = useState(true)

  const settings = getSettings(tier)

  // Capability detection has to happen on the client — during SSR we know
  // nothing about the device, and guessing wrong causes a hydration mismatch.
  useEffect(() => {
    setWebgl(hasWebGL())
    setTier(detectTier())

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    motionQuery.addEventListener('change', onMotionChange)

    // Stop rendering entirely in a background tab. On a phone this is the
    // difference between the battery surviving the afternoon and not.
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      motionQuery.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [setTier, setReducedMotion])

  const stepTier = useCallback(
    (direction: -1 | 1) => {
      const current = useUiStore.getState().tier
      const next = TIER_ORDER[Math.min(2, Math.max(0, TIER_ORDER.indexOf(current) + direction))]
      if (next !== current) setTier(next)
    },
    [setTier],
  )

  if (webgl === false || reducedMotion) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StaticBackdrop />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      {/* Painted underneath the canvas so the first frame is never a white flash. */}
      <StaticBackdrop />

      <Canvas
        className="!absolute inset-0"
        // `frameloop="never"` fully parks the render loop in a hidden tab.
        frameloop={visible ? 'always' : 'never'}
        dpr={settings.dpr}
        gl={{
          antialias: settings.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          // Reading pixels back is never needed here, and keeping this false
          // lets the driver discard the buffer after compositing.
          preserveDrawingBuffer: false,
        }}
        camera={{ fov: 35, near: 0.1, far: 120, position: [0, 0.15, 12.6] }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          scene.background = null
        }}
      >
        <PerformanceMonitor
          onDecline={() => stepTier(-1)}
          onIncline={() => stepTier(1)}
          // Three oscillations means the device genuinely can't hold a tier —
          // drop to the floor and stop thrashing.
          flipflops={3}
          onFallback={() => setTier('low')}
        >
          <Suspense fallback={null}>
            <Experience settings={settings} reducedMotion={reducedMotion} />
            <ReadySignal onReady={setReady} />
          </Suspense>
        </PerformanceMonitor>

        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  )
}

/**
 * Rendered inside <Suspense>, so it only mounts once every sibling has
 * resolved. That mount is the truthful "the scene is ready" signal the
 * preloader waits on.
 */
function ReadySignal({ onReady }: { onReady: (ready: boolean) => void }) {
  useEffect(() => {
    onReady(true)
  }, [onReady])
  return null
}
