/**
 * Device capability tiering.
 *
 * A wedding invitation gets opened on every phone in the family WhatsApp
 * group — including six-year-old Androids. We detect a tier up front and then
 * let drei's <PerformanceMonitor> demote it live if frames start dropping.
 */

export type QualityTier = 'low' | 'mid' | 'high'

export interface QualitySettings {
  tier: QualityTier
  /** [min, max] device pixel ratio handed to the <Canvas>. */
  dpr: [number, number]
  particleCount: number
  /** Postprocessing is the single most expensive thing here. */
  postprocessing: 'off' | 'bloom' | 'full'
  /** Cubemap resolution for the reflection environment. */
  envResolution: number
  /** 3D photo arc, or a plain native scroller? */
  gallery3d: boolean
  antialias: boolean
}

const PRESETS: Record<QualityTier, QualitySettings> = {
  low: {
    tier: 'low',
    dpr: [1, 1.25],
    particleCount: 1500,
    postprocessing: 'off',
    envResolution: 64,
    gallery3d: false,
    antialias: false,
  },
  mid: {
    tier: 'mid',
    dpr: [1, 1.5],
    particleCount: 6000,
    postprocessing: 'bloom',
    envResolution: 128,
    gallery3d: false,
    antialias: true,
  },
  high: {
    tier: 'high',
    dpr: [1, 2],
    particleCount: 20000,
    postprocessing: 'full',
    envResolution: 256,
    gallery3d: true,
    antialias: true,
  },
}

export function getSettings(tier: QualityTier): QualitySettings {
  return PRESETS[tier]
}

/**
 * Best-effort tier guess from what the browser will tell us.
 * Deliberately pessimistic — it is far better to start low and get promoted
 * than to start high and stutter through the first five seconds.
 */
export function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'mid'

  const cores = navigator.hardwareConcurrency ?? 4
  const dpr = window.devicePixelRatio ?? 1
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const narrow = window.innerWidth < 768
  // Chromium-only, but a strong signal when present.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory

  if (memory !== undefined && memory <= 4) return 'low'
  if (cores <= 4) return 'low'

  if (coarse || narrow) {
    // A modern flagship phone: plenty of cores and a dense screen.
    return cores >= 8 && dpr >= 2.5 ? 'mid' : 'low'
  }

  return cores >= 8 ? 'high' : 'mid'
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Is there a usable WebGL context at all? Guards the whole canvas. */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}
