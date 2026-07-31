'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { gallery } from '@/data/wedding'
import { sceneProgress, clamp, smoothstep } from '@/lib/scrollStore'

/**
 * A corridor of photographs.
 *
 * The frames alternate left and right down the Z axis and angle inward, so the
 * camera flies straight between them. Deliberately *not* a ring: a ring puts
 * photos directly in the camera's path and blocks the exit, which reads as a
 * mistake rather than a composition.
 *
 * Only rendered on the `high` tier — on phones the HTML section falls back to
 * a native horizontal scroller, which costs zero GPU and, honestly, is nicer
 * to use with a thumb.
 */

const FRAME_W = 3.4
const FRAME_H = 2.27 // 3:2
const START_Z = -16.5
const SPACING = 1.5
const OFFSET_X = 4.3

interface FrameProps {
  texture: THREE.Texture
  index: number
}

function Frame({ texture, index }: FrameProps) {
  const group = useRef<THREE.Group>(null)
  const photoMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const frameMaterial = useRef<THREE.MeshStandardMaterial>(null)

  const side = index % 2 === 0 ? -1 : 1
  const z = START_Z - index * SPACING
  const y = index % 4 < 2 ? 0.45 : -0.55

  useFrame((state) => {
    if (!group.current) return

    // Each frame gets its own slice of the gallery beat, so they arrive in
    // sequence rather than all at once. Staggering in *local* scene space
    // means it stays correct however tall the gallery section ends up.
    const local = sceneProgress('gallery')
    const stagger = index * 0.07
    const visibility =
      smoothstep(clamp((local - stagger) / 0.25)) * (1 - smoothstep(sceneProgress('rsvp') * 2.5))

    group.current.visible = visibility > 0.01
    if (!group.current.visible) return

    // Drift toward the camera path a touch as they come in — subtle parallax.
    group.current.position.x = side * (OFFSET_X + (1 - visibility) * 1.6)
    group.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.09

    if (photoMaterial.current) photoMaterial.current.opacity = visibility
    if (frameMaterial.current) frameMaterial.current.opacity = visibility * 0.9
  })

  return (
    <group ref={group} position={[side * OFFSET_X, y, z]} rotation={[0, -side * 0.52, 0]}>
      {/* Gold hairline frame, sitting a hair behind the photo. */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[FRAME_W + 0.14, FRAME_H + 0.14]} />
        <meshStandardMaterial
          ref={frameMaterial}
          color="#D4A857"
          metalness={1}
          roughness={0.25}
          emissive="#D4A857"
          emissiveIntensity={0.35}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial
          ref={photoMaterial}
          map={texture}
          transparent
          opacity={0}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function GalleryWall() {
  const urls = useMemo(() => gallery.map((item) => item.src), [])
  const loaded = useTexture(urls)
  const textures = useMemo(() => {
    const list = Array.isArray(loaded) ? loaded : [loaded]
    list.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 4
    })
    return list
  }, [loaded])

  return (
    <group>
      {textures.map((texture, index) => (
        <Frame key={gallery[index]?.src ?? index} texture={texture} index={index} />
      ))}
    </group>
  )
}
