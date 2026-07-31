'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
// import { useGLTF } from '@react-three/drei'   // ← uncomment when you add a model
import * as THREE from 'three'
import { scroll, sceneProgress, sceneRanges, remap, smoothstep, damp } from '@/lib/scrollStore'

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ★ MODEL SWAP POINT ★                                                     ║
 * ║                                                                           ║
 * ║  Right now this renders a gold torus knot — the "bandhan", the knot that  ║
 * ║  a Hindu marriage literally is. It is a deliberate placeholder.           ║
 * ║                                                                           ║
 * ║  To swap in your own .glb (rings, a mandala, a lotus):                    ║
 * ║    1. Drop the file into  /public/models/rings.glb                        ║
 * ║    2. Uncomment the useGLTF import above                                  ║
 * ║    3. Replace the <mesh> in <Ornament /> below with:                      ║
 * ║                                                                           ║
 * ║         const { scene } = useGLTF('/models/rings.glb')                    ║
 * ║         return <primitive object={scene} scale={2} />                     ║
 * ║                                                                           ║
 * ║       ...and add, outside the component:                                  ║
 * ║         useGLTF.preload('/models/rings.glb')                              ║
 * ║                                                                           ║
 * ║  IMPORTANT: whatever you use must have an OPEN CENTRE along the Z axis.   ║
 * ║  The camera flies straight through it at scroll ≈ 0.30. A solid model     ║
 * ║  will clip the near plane and flash the inside of its geometry.           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Where the piece parks for the final wide shot (see CameraRig's curve).
 *
 * Lifted well above the camera's look-at height on purpose. Dead-centre it
 * sat squarely behind the countdown and the "Kindly RSVP" heading and made
 * both unreadable — the same mistake as an oversized hero knot, at the other
 * end of the journey. Up here it crowns the section instead of blocking it.
 */
const FINALE_POSITION = new THREE.Vector3(0, 3.0, -33)

function Ornament() {
  /*
   * Deliberately slender. An earlier pass used a much chunkier knot and it
   * looked spectacular in isolation — but it filled the frame behind the
   * couple's names and made them unreadable. On an invitation the type wins
   * every argument with the 3D; the ornament's job is to frame it.
   */
  const geometry = useMemo(
    () => new THREE.TorusKnotGeometry(1.2, 0.2, 220, 32, 2, 3),
    [],
  )
  return (
    <mesh geometry={geometry} castShadow={false} receiveShadow={false}>
      <meshPhysicalMaterial
        color="#D4A857"
        metalness={1}
        roughness={0.13}
        envMapIntensity={2.1}
        clearcoat={1}
        clearcoatRoughness={0.08}
        // A whisper of iridescence stops the gold reading as flat brass.
        iridescence={0.35}
        iridescenceIOR={1.6}
        emissive="#8A5E12"
        emissiveIntensity={0}
        transparent
      />
    </mesh>
  )
}

/** Two thin bands, counter-rotating — the wedding rings, abstracted. */
function Bands() {
  const outer = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1)
    if (outer.current) {
      outer.current.rotation.z += d * 0.12
      outer.current.rotation.x = Math.PI / 2.6
    }
    if (inner.current) {
      inner.current.rotation.z -= d * 0.19
      inner.current.rotation.x = Math.PI / 2.6
      inner.current.rotation.y = Math.PI / 7
    }
  })

  return (
    <group>
      <mesh ref={outer}>
        <torusGeometry args={[2.5, 0.014, 8, 180]} />
        <meshStandardMaterial
          color="#EFD9A8"
          metalness={1}
          roughness={0.2}
          emissive="#D4A857"
          emissiveIntensity={0.7}
          transparent
        />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[2.05, 0.01, 8, 180]} />
        <meshStandardMaterial
          color="#C98B7A"
          metalness={1}
          roughness={0.25}
          emissive="#C98B7A"
          emissiveIntensity={0.5}
          transparent
        />
      </mesh>
    </group>
  )
}

export function Centrepiece() {
  const group = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const currentScale = useRef(1)
  const { size } = useThree()

  /*
   * The finale sits close to the camera, so on a tall narrow phone the outer
   * bands ended up wider than the visible frame and bled off both edges,
   * burying the footer. CameraRig widens the FOV in portrait to keep framing
   * consistent, but that only helps things at the centre of the shot — an
   * object this close still needs its own correction.
   */
  const portraitScale = Math.min(1, 0.35 + (size.width / Math.max(size.height, 1)) * 0.65)

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1)
    const p = scroll.smooth

    if (spin.current) {
      // Ambient rotation, gently accelerated by scroll velocity so the piece
      // feels physically connected to the guest's thumb.
      spin.current.rotation.y += d * (0.15 + Math.abs(scroll.velocity) * 0.9)
      spin.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.12
    }

    if (!group.current) return

    /*
     * The teleport.
     *
     * Once the camera has flown through the knot, the origin is behind it and
     * stays behind it — so during the timeline beat the piece is off-screen
     * and we can silently move it to the far end of the corridor, ready for
     * the finale. Moving it is free; flying it past the near plane would clip.
     *
     * The handover happens at the START OF THE GALLERY, not the timeline.
     * Teleporting at the timeline dropped it directly into frame behind the
     * itinerary cards, because the camera looks down -Z the entire journey —
     * "behind the camera" and "further down the corridor" are not the same
     * place, which is exactly the mistake that produced a floating knot in
     * the middle of the schedule.
     */
    const inFinalePosition = p >= sceneRanges.gallery[0]
    if (inFinalePosition) {
      group.current.position.copy(FINALE_POSITION)
    } else {
      group.current.position.set(0, 0, 0)
    }

    // Swell on approach; in the finale, grow from nothing so it reads as
    // something emerging out of the fog rather than appearing from nowhere.
    const approach = smoothstep(sceneProgress('approach'))
    const emerge = inFinalePosition ? smoothstep(sceneProgress('gallery') / 0.45) : 1
    const targetScale =
      (1 + approach * 0.22) * (inFinalePosition ? emerge * 0.62 * portraitScale : 1)
    currentScale.current = damp(currentScale.current, targetScale, 3.5, d)
    group.current.scale.setScalar(currentScale.current)

    /*
     * Crossing the threshold: the metal blooms and then dissolves into light.
     *
     * This isn't only for drama. The camera passes within a fraction of a unit
     * of the tube wall, and in portrait — where CameraRig widens the FOV to
     * keep framing consistent — that filled the entire phone screen with a
     * solid sheet of gold, burying the invitation copy underneath it.
     *
     * Fading the piece out as we enter fixes the legibility and reads better
     * than the alternatives: the ornament turns to light exactly as you pass
     * through it, and bloom does the rest.
     */
    const flash = Math.sin(smoothstep(sceneProgress('through')) * Math.PI) // peaks mid-pass

    /*
     * The fade begins partway through the APPROACH, not at the threshold.
     * By the time the camera is close enough to pass through, the knot
     * already covers most of a portrait screen — on a tablet it completely
     * buried the invocation. Starting the dissolve during the approach means
     * the ornament thins out exactly as the copy needs the room.
     */
    const fadeStart = THREE.MathUtils.lerp(sceneRanges.approach[0], sceneRanges.approach[1], 0.4)
    const fadeEnd = THREE.MathUtils.lerp(sceneRanges.through[0], sceneRanges.through[1], 0.5)
    const dissolve = smoothstep(remap(p, fadeStart, fadeEnd))
    const opacity = inFinalePosition ? emerge : 1 - dissolve

    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      const material = mesh.material as THREE.Material & { emissiveIntensity?: number }
      material.opacity = opacity
      // Only the knot itself flares; the thin bands keep their steady glow.
      if (mesh.geometry.type === 'TorusKnotGeometry') {
        material.emissiveIntensity = approach * 0.25 + flash * 1.6
      }
    })
  })

  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.45} floatingRange={[-0.12, 0.12]}>
        <group ref={spin}>
          <Ornament />
        </group>
        <Bands />
      </Float>
    </group>
  )
}
