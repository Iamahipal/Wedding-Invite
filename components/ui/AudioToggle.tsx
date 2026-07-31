'use client'

import { useEffect, useRef, useState } from 'react'
import { useUiStore } from '@/lib/uiStore'

/**
 * ★ AUDIO SWAP POINT ★
 *
 * Drop a shehnai or sitar loop at /public/audio/ambient.mp3 — 30–60 seconds,
 * under ~1.5 MB, and make sure the last beat leads back into the first so the
 * loop is seamless.
 *
 * If the file isn't there, this component detects the load error and removes
 * itself from the page. No broken control, no console noise.
 *
 * Sound is ALWAYS off by default. Browsers block autoplay for good reason,
 * and a wedding invitation that starts blaring music in a quiet office is a
 * wedding invitation that gets closed.
 */

const SRC = '/audio/ambient.mp3'
const TARGET_VOLUME = 0.32
const FADE_MS = 900

export function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const fadeRef = useRef<number | null>(null)
  const entered = useUiStore((state) => state.entered)
  const audioOn = useUiStore((state) => state.audioOn)
  const toggleAudio = useUiStore((state) => state.toggleAudio)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !entered) return
    // Nothing to fade out of if it never started playing.
    if (!audioOn && audio.paused) return

    if (fadeRef.current) cancelAnimationFrame(fadeRef.current)

    const from = audio.volume
    const to = audioOn ? TARGET_VOLUME : 0
    const start = performance.now()

    const step = (now: number) => {
      // Clamped at BOTH ends. requestAnimationFrame reports the timestamp of
      // the frame it belongs to, which can predate the `performance.now()`
      // captured a moment ago — that made `t` negative, overshot the ramp, and
      // threw "volume outside the range [0, 1]" on the very first frame.
      const t = Math.max(0, Math.min(1, (now - start) / FADE_MS))
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * t))
      if (t < 1) {
        fadeRef.current = requestAnimationFrame(step)
      } else if (!audioOn) {
        audio.pause()
      }
    }

    if (audioOn) {
      audio.volume = 0
      // The click that toggled this IS the user gesture, so play() resolves.
      audio.play().then(
        () => {
          fadeRef.current = requestAnimationFrame(step)
        },
        () => setAvailable(false),
      )
    } else {
      fadeRef.current = requestAnimationFrame(step)
    }

    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current)
    }
  }, [audioOn, entered])

  if (!available) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={SRC}
        loop
        preload="none"
        onError={() => setAvailable(false)}
      />

      <button
        type="button"
        onClick={toggleAudio}
        aria-pressed={audioOn}
        aria-label={audioOn ? 'Turn music off' : 'Turn music on'}
        className="glass grain group fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full text-gold transition-colors duration-300 hover:text-champagne sm:right-6 sm:top-6"
      >
        {/* Four bars that animate only while playing — a tiny equaliser. */}
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className="w-[2px] rounded-full bg-current"
              style={{
                height: audioOn ? undefined : '4px',
                animation: audioOn
                  ? `drift ${0.7 + bar * 0.16}s ease-in-out ${bar * 0.09}s infinite alternate`
                  : undefined,
                ...(audioOn ? { height: `${[10, 16, 7, 13][bar]}px` } : {}),
              }}
            />
          ))}
        </span>
      </button>
    </>
  )
}
