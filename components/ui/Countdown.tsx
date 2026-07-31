'use client'

import { useEffect, useState } from 'react'
import { weddingDate } from '@/data/wedding'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function timeUntil(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now())
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
]

export function Countdown({ className = '' }: { className?: string }) {
  const target = new Date(weddingDate).getTime()

  // Rendering the real countdown on the server would guarantee a hydration
  // mismatch — the clock has moved on by the time the HTML reaches the phone.
  // So we render dashes until mount, then start ticking.
  const [mounted, setMounted] = useState(false)
  const [left, setLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)
    setLeft(timeUntil(target))
    const id = window.setInterval(() => setLeft(timeUntil(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  const passed = mounted && target - Date.now() <= 0

  if (passed) {
    return (
      <p className={`font-display text-2xl text-champagne ${className}`}>
        Married, at last. Thank you for celebrating with us.
      </p>
    )
  }

  return (
    <div className={className}>
      <p className="tracking-luxe mb-4 text-center text-[0.62rem] text-gold/70 sm:text-xs">
        Counting down
      </p>
      <div className="flex items-start justify-center gap-2 sm:gap-5">
        {UNITS.map(({ key, label }, index) => (
          <div key={key} className="flex items-start gap-2 sm:gap-5">
            <div className="min-w-[3.4rem] text-center sm:min-w-[4.75rem]">
              <div
                className="font-display text-4xl leading-none font-light text-gilded tabular-nums sm:text-6xl"
                // Announce only the whole phrase, not each ticking digit.
                aria-hidden={!mounted}
              >
                {mounted ? String(left[key]).padStart(2, '0') : '––'}
              </div>
              <div className="tracking-luxe mt-2 text-[0.55rem] text-ivory/45 sm:text-[0.6rem]">
                {label}
              </div>
            </div>
            {index < UNITS.length - 1 && (
              <span className="font-display text-3xl leading-none text-gold/25 sm:text-5xl" aria-hidden>
                :
              </span>
            )}
          </div>
        ))}
      </div>
      {mounted && (
        <p className="sr-only" aria-live="polite">
          {left.days} days, {left.hours} hours and {left.minutes} minutes until the wedding.
        </p>
      )}
    </div>
  )
}
