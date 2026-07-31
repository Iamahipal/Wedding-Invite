'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneProgress, spanProgress, smoothstep } from '@/lib/scrollStore'

/**
 * Two architectures, converging.
 *
 * LEFT  — a Rajasthani *jharokha*: the cusped, scalloped overhanging window
 *         you see all over Jaipur and Jodhpur. Sandstone amber.
 * RIGHT — an Awadhi *nawabi* arch: the tall pointed ogee of Lucknow's
 *         imambaras. Chikankari ivory.
 *
 * They start far apart, drift together as the guest scrolls, and interlock at
 * the centre. That is the whole "Marwar meets Awadh" idea told in geometry
 * instead of words — which is why the copy beside it can stay to one line.
 */

type ArchStyle = 'jharokha' | 'nawabi'

/** Sample the outline of an arch as a polyline: left jamb → crown → right jamb. */
function archProfile(
  width: number,
  height: number,
  style: ArchStyle,
  segments = 96,
): THREE.Vector2[] {
  const hw = width / 2
  const spring = height * 0.5 // where the jamb ends and the arch begins
  const archH = height - spring
  const points: THREE.Vector2[] = [
    new THREE.Vector2(-hw, 0),
    new THREE.Vector2(-hw, spring),
  ]

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = Math.PI * (1 - t) // π → 0, sweeping left to right
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    if (style === 'jharokha') {
      // Five shallow lobes carved into a semicircle — the cusped Rajput arch.
      const lobe = 1 - 0.13 * Math.abs(Math.sin(5 * Math.PI * t))
      points.push(new THREE.Vector2(cos * hw * lobe, spring + sin * archH * lobe))
    } else {
      // Pinched at the crown so it resolves to a point rather than a dome.
      const pinch = 1 - 0.24 * Math.pow(sin, 3)
      points.push(new THREE.Vector2(cos * hw * pinch, spring + Math.pow(sin, 0.55) * archH))
    }
  }

  points.push(new THREE.Vector2(hw, 0))
  return points
}

/** An arch-shaped *frame* — the outline minus a smaller arch punched out. */
function useArchGeometry(style: ArchStyle) {
  return useMemo(() => {
    /*
     * Sized so the WHOLE arch — crown included — fits the frame from the
     * camera's twoWorlds position. An earlier pass had them at 5.4 × 8.6 and
     * only 3.6 units away: all you ever saw were two vertical legs running off
     * the top of the screen, which read as abstract columns, not architecture.
     * If you retune ARCH_Z, retune these together.
     */
    const width = 3.8
    const height = 5.6
    const thickness = 0.34

    const shape = new THREE.Shape(archProfile(width, height, style))

    const hole = new THREE.Path(
      archProfile(width - thickness * 2, height - thickness * 1.6, style).map(
        (p) => new THREE.Vector2(p.x, p.y + thickness),
      ),
    )
    shape.holes.push(hole)

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
      curveSegments: 8,
    })
    geometry.center()
    return geometry
  }, [style])
}

/** Far enough down the corridor that the full silhouette reads at once. */
const ARCH_Z = -17

interface ArchProps {
  style: ArchStyle
  /** -1 for the left arch, +1 for the right. */
  side: -1 | 1
  color: string
  glowColor: string
}

function Arch({ style, side, color, glowColor }: ArchProps) {
  const group = useRef<THREE.Group>(null)
  const geometry = useArchGeometry(style)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const glow = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!group.current) return

    // They appear as we exit the ring and finish converging exactly as the
    // "Marwar meets Awadh" copy finishes reading.
    const p = smoothstep(spanProgress('through', 'twoWorlds', 0, 1))

    // Far apart → interlocked at the centre.
    group.current.position.x = side * THREE.MathUtils.lerp(4.8, 1.15, p)
    // Turned outward at first, squaring up to face the camera as they meet.
    group.current.rotation.y = side * THREE.MathUtils.lerp(-0.55, -0.08, p)
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.3 + side) * 0.16

    // Visible only around this beat — no point shading them the rest of the time.
    const visibility =
      smoothstep(sceneProgress('through')) *
      (1 - smoothstep(sceneProgress('timeline') * 3))
    group.current.visible = visibility > 0.01

    if (material.current) {
      material.current.opacity = visibility
      material.current.emissiveIntensity = 0.25 + p * 0.75
    }
    if (glow.current) {
      const glowMaterial = glow.current.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = visibility * 0.16
    }
  })

  return (
    <group ref={group} position={[side * 4.8, 0, ARCH_Z]}>
      {/* Soft backlight so each arch reads as a silhouette against the dark. */}
      <mesh ref={glow} position={[0, 0, -1.1]}>
        <circleGeometry args={[3.1, 48]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={material}
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.3}
          metalness={0.35}
          roughness={0.55}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  )
}

export function ArchGate() {
  return (
    <group>
      {/* Marwar — Jaipur sandstone, warm amber */}
      <Arch style="jharokha" side={-1} color="#C9A273" glowColor="#E8A33D" />
      {/* Awadh — chikankari ivory, cool candlelight */}
      <Arch style="nawabi" side={1} color="#F5EFE3" glowColor="#EFD9A8" />
    </group>
  )
}
