'use client'

import { copy, events, type WeddingEvent } from '@/data/wedding'
import { GlassCard } from '@/components/ui/GlassCard'
import { RevealText, Reveal } from '@/components/ui/RevealText'
import { Divider } from '@/components/ui/Ornament'
import { AddToCalendar, AddAllToCalendar } from '@/components/ui/AddToCalendar'

/**
 * Always format in Asia/Kolkata explicitly.
 *
 * Without a fixed timeZone, the server renders in UTC and the phone renders in
 * the guest's local zone — so a 9:30 PM muhurat becomes "27 Nov" on the server
 * and "28 Nov" for a guest in Sydney, and React throws a hydration mismatch.
 * The wedding happens in India; the dates should say so wherever you open it.
 */
const dayFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  timeZone: 'Asia/Kolkata',
})
const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  timeZone: 'Asia/Kolkata',
})
const weekdayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  timeZone: 'Asia/Kolkata',
})

/** Marwar runs warm, Awadh runs pale, shared rituals sit on gold. */
const ACCENT: Record<WeddingEvent['tradition'], string> = {
  marwar: 'text-marigold',
  awadh: 'text-champagne',
  both: 'text-gold',
}

const ACCENT_DOT: Record<WeddingEvent['tradition'], string> = {
  marwar: 'bg-marigold',
  awadh: 'bg-champagne',
  both: 'bg-gold',
}

function EventCard({ event, index }: { event: WeddingEvent; index: number }) {
  const date = new Date(event.start)
  const onLeft = index % 2 === 0

  return (
    <li className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-12 last:pb-0 lg:grid-cols-[1fr_5rem_1fr] lg:gap-x-0 lg:pb-20">
      {/* Node on the rail */}
      <div className="col-start-1 row-start-1 flex justify-center pt-7 lg:col-start-2 lg:pt-9">
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span
            className={`absolute h-3 w-3 rounded-full ${ACCENT_DOT[event.tradition]} opacity-25`}
            style={{ filter: 'blur(3px)' }}
          />
          <span className={`h-[7px] w-[7px] rounded-full ${ACCENT_DOT[event.tradition]}`} />
        </span>
      </div>

      <Reveal
        y={32}
        delay={0.05}
        className={[
          'col-start-2 row-start-1 lg:row-start-1',
          onLeft ? 'lg:col-start-1 lg:pr-10 lg:text-right' : 'lg:col-start-3 lg:pl-10',
        ].join(' ')}
      >
        <GlassCard as="article" interactive flourish className="p-6 sm:p-8">
          <div
            className={`flex items-baseline gap-3 ${onLeft ? 'lg:justify-end' : ''}`}
          >
            <span className={`font-display text-3xl leading-none font-light ${ACCENT[event.tradition]}`}>
              {dayFormatter.format(date)}
            </span>
            <span className="tracking-luxe text-[0.55rem] text-ivory/45">
              {monthFormatter.format(date)} · {weekdayFormatter.format(date)}
            </span>
          </div>

          <h3 className="mt-5 font-display text-2xl font-light text-ivory sm:text-3xl">
            {event.name}
            <span className="ml-3 font-deva text-base text-gold/55 sm:text-lg">
              {event.nameHi}
            </span>
          </h3>

          <p className={`mt-3 font-body text-sm ${ACCENT[event.tradition]}`}>
            {event.displayTime}
          </p>

          <p className="mt-5 font-body text-[0.83rem] leading-relaxed text-ivory/60">
            {event.description}
          </p>

          <dl
            className={`mt-6 space-y-2.5 border-t border-ivory/10 pt-5 text-[0.72rem] ${
              onLeft ? 'lg:text-right' : ''
            }`}
          >
            <div>
              <dt className="tracking-luxe text-[0.52rem] text-ivory/35">Venue</dt>
              <dd className="mt-1 text-ivory/75">{event.venue}</dd>
              <dd className="mt-0.5 text-ivory/40">{event.address}</dd>
            </div>
            <div>
              <dt className="tracking-luxe text-[0.52rem] text-ivory/35">Dress code</dt>
              <dd className="mt-1 text-ivory/75">{event.dressCode}</dd>
            </div>
          </dl>

          <div className={onLeft ? 'lg:flex lg:justify-end' : ''}>
            <AddToCalendar event={event} />
          </div>
        </GlassCard>
      </Reveal>
    </li>
  )
}

export function Timeline() {
  return (
    <section
      data-scene="timeline"
      className="relative px-5 py-28 sm:px-8 lg:py-40"
      aria-label="Schedule of events"
    >
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <Reveal>
            <p className="tracking-luxe text-[0.58rem] text-gold/75 sm:text-[0.68rem]">
              {copy.timeline.eyebrow}
            </p>
          </Reveal>

          <RevealText
            text={copy.timeline.title}
            as="h2"
            by="char"
            delay={0.12}
            className="text-gilded mt-6 block font-display text-[clamp(2rem,7vw,4.25rem)] leading-tight font-light"
          />

          <Reveal delay={0.28}>
            <p className="mx-auto mt-6 max-w-md font-body text-sm text-ivory/55">
              {copy.timeline.body}
            </p>
            <Divider variant="mandana" className="mt-12" />
          </Reveal>
        </header>

        <ol className="relative mt-20">
          {/* The rail. Left-aligned on phones, centred once there's room. */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-[1.25rem] w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent lg:left-1/2"
          />
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </ol>

        <Reveal className="mt-16 text-center" delay={0.1}>
          <AddAllToCalendar events={events} />
        </Reveal>
      </div>
    </section>
  )
}
