'use client'

import { useState } from 'react'
import type { WeddingEvent } from '@/data/wedding'
import { downloadICS, googleCalendarUrl } from '@/lib/calendar'

/**
 * Two buttons, because there is no single "add to calendar" that works
 * everywhere: Google Calendar takes a URL, and Apple/Outlook want an .ics.
 * Offering both is the difference between guests actually saving the date and
 * meaning to.
 */
export function AddToCalendar({ event }: { event: WeddingEvent }) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="tracking-luxe rounded-full border border-gold/25 px-3.5 py-2 text-[0.55rem] text-gold/85 transition-colors duration-300 hover:border-gold/60 hover:text-champagne"
      >
        Google Calendar
      </a>

      <button
        type="button"
        onClick={() => {
          downloadICS([event], `${event.id}-mahipal-niharika`)
          setSaved(true)
          window.setTimeout(() => setSaved(false), 2600)
        }}
        className="tracking-luxe rounded-full border border-gold/25 px-3.5 py-2 text-[0.55rem] text-gold/85 transition-colors duration-300 hover:border-gold/60 hover:text-champagne"
      >
        {saved ? 'Downloaded ✓' : 'Apple / Outlook'}
      </button>
    </div>
  )
}

/** One button that saves the whole four-day itinerary at once. */
export function AddAllToCalendar({ events }: { events: WeddingEvent[] }) {
  const [saved, setSaved] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        downloadICS(events, 'mahipal-niharika-wedding')
        setSaved(true)
        window.setTimeout(() => setSaved(false), 2600)
      }}
      className="tracking-luxe group relative px-8 py-3.5 text-[0.62rem] text-champagne sm:text-xs"
    >
      <span className="absolute inset-0 rounded-full border border-gold/40 transition-colors duration-500 group-hover:border-gold" />
      <span className="absolute inset-0 rounded-full bg-gold/0 transition-colors duration-500 group-hover:bg-gold/10" />
      <span className="relative">
        {saved ? 'Added to your calendar ✓' : 'Save all events to calendar'}
      </span>
    </button>
  )
}
