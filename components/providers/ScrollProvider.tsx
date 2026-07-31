'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll, measureScenes } from '@/lib/scrollStore'
import { useUiStore } from '@/lib/uiStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * The bridge between the guest's thumb and the camera.
 *
 * Lenis smooths the wheel, GSAP ScrollTrigger reports normalised progress, and
 * that progress is written straight into the plain `scroll` object from
 * scrollStore.ts. No React state is involved anywhere in this loop.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useUiStore((state) => state.reducedMotion)

  useEffect(() => {
    scroll.viewportHeight = window.innerHeight
    measureScenes()

    // Reduced motion: no smoothing, no camera journey. Native scroll only.
    if (reducedMotion) {
      scroll.progress = 0
      scroll.smooth = 0
      return
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // ── The single most important line in this file ──────────────────────
      // Hijacking touch momentum is what makes "smooth scroll" sites feel
      // broken on phones: the page lags a finger that has already stopped.
      // Smooth the wheel, leave the thumb alone.
      syncTouch: false,
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    // Drive Lenis from GSAP's ticker rather than its own rAF, so scroll and
    // animation advance on the same clock and can never disagree by a frame.
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    lenis.on('scroll', ScrollTrigger.update)

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      // scrub is unnecessary here — we take the raw progress and damp it
      // ourselves inside useFrame, which stays smooth even if a frame drops.
      onUpdate: (self) => {
        scroll.progress = self.progress
      },
    })

    const onResize = () => {
      scroll.viewportHeight = window.innerHeight
      ScrollTrigger.refresh()
      measureScenes()
    }
    window.addEventListener('resize', onResize)
    // iOS fires resize late on rotate; orientationchange catches it properly.
    window.addEventListener('orientationchange', onResize)

    // Sections grow as fonts swap and images decode, which moves every scene
    // boundary. Re-measure whenever the page height actually changes rather
    // than guessing at a timeout.
    const observer = new ResizeObserver(() => {
      ScrollTrigger.refresh()
      measureScenes()
    })
    observer.observe(document.body)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      trigger.kill()
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [reducedMotion])

  return <>{children}</>
}
