'use client'

import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import type { QualitySettings } from '@/lib/quality'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { Centrepiece } from './Centrepiece'
import { Particles } from './Particles'
import { ArchGate } from './ArchGate'
import { GalleryWall } from './GalleryWall'
import { Effects } from './Effects'

interface ExperienceProps {
  settings: QualitySettings
  reducedMotion: boolean
}

export function Experience({ settings, reducedMotion }: ExperienceProps) {
  return (
    <>
      {/* Fog is animated by Lighting — it's how the palette warms up. */}
      <fog attach="fog" args={['#0A0E1A', 8, 45]} />

      <CameraRig reducedMotion={reducedMotion} />
      <Lighting resolution={settings.envResolution} />

      <Centrepiece />
      <Particles count={settings.particleCount} />
      <ArchGate />

      {/*
        The photo corridor loads textures, so it gets its own Suspense
        boundary — a slow image must never hold back the rest of the scene.
        On low/mid tiers it doesn't render at all; the HTML gallery section
        falls back to a native scroller instead.
      */}
      {settings.gallery3d && (
        <Suspense fallback={null}>
          <GalleryWall />
        </Suspense>
      )}

      <Effects settings={settings} />

      {/* Compile every material up front so nothing hitches on first sight. */}
      <Preload all />
    </>
  )
}
