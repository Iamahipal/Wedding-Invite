/**
 * The single most important file for performance.
 *
 * Scroll position is written into a plain module-level object — NOT React
 * state. GSAP ScrollTrigger writes to it ~60×/sec; the R3F `useFrame` loop
 * reads it. Nothing re-renders. The naive `onUpdate → setState` pattern would
 * re-render the entire 3D tree every frame and make mid-range Android unusable.
 */

export interface ScrollState {
  /** Raw page progress, 0 → 1. Written by ScrollTrigger. */
  progress: number
  /** Damped progress, updated inside useFrame. What the camera actually follows. */
  smooth: number
  /** Signed scroll velocity, normalised-ish. Drives particle streaking. */
  velocity: number
  /** Viewport height in px, cached so scenes don't thrash layout. */
  viewportHeight: number
}

export const scroll: ScrollState = {
  progress: 0,
  smooth: 0,
  velocity: 0,
  viewportHeight: 1,
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENE MAP
//  Every beat of the journey, as a normalised [start, end] slice of the page.
//  The camera curve, the particle morph and the arch convergence all read from
//  this one table.
//
//  These defaults are only a first guess for the very first frame. On mount,
//  `measureScenes()` replaces them with the REAL boundaries measured from the
//  DOM. That matters more than it sounds: add two more events to the itinerary
//  or a longer paragraph of copy and the sections grow — with hardcoded
//  fractions the 3D would silently drift out of sync with the words on screen,
//  and the camera would fly through the ring while the guest is still reading
//  the invitation. Measuring makes the site immune to content edits, which is
//  exactly what a wedding site needs.
// ─────────────────────────────────────────────────────────────────────────────

export const SCENE_ORDER = [
  'hero',
  'approach',
  'through',
  'twoWorlds',
  'timeline',
  'gallery',
  'rsvp',
] as const

export type SceneName = (typeof SCENE_ORDER)[number]

export const sceneRanges: Record<SceneName, [number, number]> = {
  hero: [0.0, 0.15],
  approach: [0.15, 0.26],
  through: [0.26, 0.34],
  twoWorlds: [0.34, 0.44],
  timeline: [0.44, 0.62],
  gallery: [0.62, 0.78],
  rsvp: [0.78, 1.0],
}

/**
 * Camera keyframe positions in page-progress space: the start of every beat,
 * plus 1.0 to close the last segment. CameraRig reads this each frame.
 */
export const sceneKeyTimes: number[] = [
  ...SCENE_ORDER.map((name) => sceneRanges[name][0]),
  1,
]

/**
 * Read the true position of each beat from the DOM.
 *
 * Every section marks itself with `data-scene="<name>"`. Call this after
 * mount, on resize, and whenever content changes.
 */
export function measureScenes(): void {
  if (typeof document === 'undefined') return

  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) return

  let previous: SceneName | null = null

  for (const name of SCENE_ORDER) {
    const element = document.querySelector<HTMLElement>(`[data-scene="${name}"]`)
    if (!element) continue

    const top = element.getBoundingClientRect().top + window.scrollY
    const start = clamp(top / max)
    sceneRanges[name][0] = start
    // A beat runs until the next one begins — no gaps, no overlaps.
    if (previous) sceneRanges[previous][1] = start
    previous = name
  }

  if (previous) sceneRanges[previous][1] = 1

  SCENE_ORDER.forEach((name, index) => {
    sceneKeyTimes[index] = sceneRanges[name][0]
  })
  sceneKeyTimes[SCENE_ORDER.length] = 1
}

// ─────────────────────────────────────────────────────────────────────────────
//  MATH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v

/** Map `v` from [inMin, inMax] onto [outMin, outMax], clamped. */
export function remap(
  v: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1,
) {
  if (inMax === inMin) return outMin
  const t = clamp((v - inMin) / (inMax - inMin))
  return outMin + t * (outMax - outMin)
}

/** Local 0→1 progress within a named scene. */
export function sceneProgress(name: SceneName, p = scroll.smooth) {
  const [start, end] = sceneRanges[name]
  return remap(p, start, end)
}

/**
 * Progress across a span that stretches between two different beats — for
 * transitions that don't fit inside a single scene (the particles dispersing,
 * the arches converging). `edge` picks the start (0) or end (1) of each beat.
 *
 * Always prefer this over hardcoded fractions: it keeps every 3D transition
 * tied to the measured DOM boundaries.
 */
export function spanProgress(
  from: SceneName,
  to: SceneName,
  fromEdge: 0 | 1 = 0,
  toEdge: 0 | 1 = 0,
  p = scroll.smooth,
) {
  return remap(p, sceneRanges[from][fromEdge], sceneRanges[to][toEdge])
}

/** Smoothstep — the ease every hand-rolled 3D transition should use. */
export const smoothstep = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}

/**
 * Frame-rate-independent exponential damping.
 * `lambda` is roughly "how many e-foldings per second" — 4 is snappy, 1 is lazy.
 */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}
