'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, damp, sceneKeyTimes } from '@/lib/scrollStore'

/**
 * The camera journey.
 *
 * Two Catmull-Rom curves — one the camera travels along, one it looks at —
 * sampled by damped scroll progress. Because the look-at target is a separate
 * curve rather than a fixed point, the camera can glance sideways at the
 * arches while still flying forward, which is what makes it feel shot rather
 * than scripted.
 *
 * This component ALSO owns scroll smoothing, and registers at priority -1 so
 * it runs before every other useFrame in the scene. Everything downstream
 * (particles, centrepiece, arches) then reads an already-updated
 * `scroll.smooth` in the same frame — no one-frame lag, no ordering bugs.
 */

/**
 * ── KEYFRAME SEMANTICS — read this before retuning ──────────────────────────
 *
 * Entry `i` is the pose the camera holds at the **START of beat `i`**, and
 * `sceneKeyTimes[i]` is where that beat actually begins on the page (measured
 * from the DOM, not guessed). The camera therefore travels from pose[i] to
 * pose[i+1] *across the whole of beat i*.
 *
 * The consequence is easy to get wrong, and I got it wrong first time round:
 * the dramatic move belonging to a beat must be written into the pose of the
 * beat AFTER it. The close-up on the ring lives at index 2 — the start of
 * "through" — because that is where the approach ends. Putting it at index 1
 * made the camera perform its entire approach while the guest was still
 * reading the hero, so it arrived on top of the knot before the invocation
 * had even scrolled into view.
 */
const CAMERA_PATH = [
  new THREE.Vector3(0.0, 0.15, 12.6), // hero start — wide, the knot haloes the names
  new THREE.Vector3(0.25, 0.12, 11.4), // approach start — barely moved; the hero holds
  new THREE.Vector3(0.0, 0.0, 1.0), // through start — the approach has landed us at the threshold
  new THREE.Vector3(0.0, 0.05, -3.2), // twoWorlds start — we are out the other side
  new THREE.Vector3(0.0, 0.35, -8.5), // timeline start — the arches have converged ahead
  new THREE.Vector3(-0.9, 1.05, -13.5), // gallery start — risen above the particle field
  new THREE.Vector3(0.2, 0.6, -20.4), // rsvp start — deep in the photo corridor
  new THREE.Vector3(0.0, 0.9, -27.5), // page end — pulled back, everything visible
]

const LOOK_PATH = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -0.6),
  new THREE.Vector3(0, 0, -7.0),
  new THREE.Vector3(0, 0.1, -17.0), // the arches
  new THREE.Vector3(0, 0.5, -19.0),
  new THREE.Vector3(0, 0.4, -25.0),
  new THREE.Vector3(0, 0.3, -33.0), // the centrepiece, back in frame for the finale
]

const BASE_FOV = 35

interface CameraRigProps {
  reducedMotion: boolean
}

export function CameraRig({ reducedMotion }: CameraRigProps) {
  const { camera, size } = useThree()

  const cameraCurve = useMemo(() => new THREE.CatmullRomCurve3(CAMERA_PATH, false, 'catmullrom', 0.4), [])
  const lookCurve = useMemo(() => new THREE.CatmullRomCurve3(LOOK_PATH, false, 'catmullrom', 0.4), [])

  const position = useRef(new THREE.Vector3().copy(CAMERA_PATH[0]))
  const target = useRef(new THREE.Vector3().copy(LOOK_PATH[0]))
  const scratchPosition = useRef(new THREE.Vector3())
  const scratchTarget = useRef(new THREE.Vector3())
  const pointer = useRef({ x: 0, y: 0 })
  const lastProgress = useRef(0)

  // Pointer parallax is a mouse affordance. On touch, `state.pointer` freezes
  // wherever the last tap landed and the scene sits permanently off-centre —
  // so switch it off entirely for coarse pointers.
  const parallax = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches ? 1 : 0,
    [],
  )

  /**
   * Map scroll progress onto curve parameter space.
   *
   * CatmullRomCurve3.getPoint(u) gives every segment an equal slice of u, so
   * finding which keyframe pair we're between and converting to
   * `(index + local) / segments` aligns the curve exactly to the scene table.
   * Using getPointAt() instead would distribute by arc length and silently
   * desynchronise the 3D from the HTML.
   */
  const toCurveU = (t: number) => {
    const keys = sceneKeyTimes
    const segments = keys.length - 1
    if (t <= keys[0]) return 0
    if (t >= keys[segments]) return 1
    let i = 0
    while (i < segments - 1 && t > keys[i + 1]) i++
    const span = keys[i + 1] - keys[i]
    const local = span === 0 ? 0 : (t - keys[i]) / span
    return (i + local) / segments
  }

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1)

    // ── 1. Smooth the raw scroll value ──────────────────────────────────────
    // ScrollTrigger already applies its own scrub, but a second damping pass
    // here is what removes the last of the stepping on low-refresh screens.
    scroll.smooth = damp(scroll.smooth, scroll.progress, 5.5, d)
    scroll.velocity = (scroll.smooth - lastProgress.current) / Math.max(d, 0.001)
    lastProgress.current = scroll.smooth

    // ── 2. Keep framing consistent across every aspect ratio ────────────────
    // Portrait phones need a wider field or the centrepiece crops. The 0.5
    // exponent is a compromise between "correct" (1.0, far too wide) and
    // "ignore it" (0.0, badly cropped).
    const aspect = size.width / Math.max(size.height, 1)
    const perspective = camera as THREE.PerspectiveCamera
    const targetFov = BASE_FOV / Math.pow(Math.min(aspect, 1), 0.5)
    if (Math.abs(perspective.fov - targetFov) > 0.01) {
      perspective.fov = targetFov
      perspective.updateProjectionMatrix()
    }

    // ── 3. Reduced motion: one good static frame, and stop ──────────────────
    if (reducedMotion) {
      camera.position.set(0, 0.3, 9.5)
      camera.lookAt(0, 0, 0)
      return
    }

    // ── 4. Sample both curves ───────────────────────────────────────────────
    const u = toCurveU(scroll.smooth)
    cameraCurve.getPoint(u, scratchPosition.current)
    lookCurve.getPoint(u, scratchTarget.current)

    // Mouse parallax — tiny, and only meaningful on a desktop pointer.
    if (parallax) {
      pointer.current.x = damp(pointer.current.x, state.pointer.x, 2.5, d)
      pointer.current.y = damp(pointer.current.y, state.pointer.y, 2.5, d)
      scratchPosition.current.x += pointer.current.x * 0.45
      scratchPosition.current.y += pointer.current.y * 0.28
    }

    // Damping the sampled point (rather than the parameter) means an abrupt
    // scroll jump still resolves as a smooth move instead of a teleport.
    position.current.lerp(scratchPosition.current, 1 - Math.exp(-7 * d))
    target.current.lerp(scratchTarget.current, 1 - Math.exp(-5 * d))

    camera.position.copy(position.current)
    camera.lookAt(target.current)

    // A slow roll keeps the horizon from feeling locked to the viewport.
    camera.rotation.z += Math.sin(state.clock.elapsedTime * 0.13) * 0.006
  }, -1)

  return null
}
