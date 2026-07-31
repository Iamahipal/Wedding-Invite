import type { WeddingEvent } from '@/data/wedding'
import { couple } from '@/data/wedding'

/** `2026-11-27T21:30:00+05:30` → `20261127T160000Z` */
function toICSStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** RFC 5545 wants CRLF line endings and long lines folded at 75 octets. */
function fold(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = [line.slice(0, 75)]
  let rest = line.slice(75)
  while (rest.length > 74) {
    chunks.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  if (rest.length) chunks.push(' ' + rest)
  return chunks.join('\r\n')
}

/** Commas, semicolons and newlines are structural in ICS — escape them. */
function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function eventTitle(event: WeddingEvent): string {
  return `${event.name} — ${couple.groom.firstName} & ${couple.bride.firstName}`
}

export function buildICS(events: WeddingEvent[]): string {
  const stamp = toICSStamp(new Date().toISOString())

  const body = events.flatMap((event) => [
    'BEGIN:VEVENT',
    fold(`UID:${event.id}-mahipal-niharika@wedding.invite`),
    `DTSTAMP:${stamp}`,
    `DTSTART:${toICSStamp(event.start)}`,
    `DTEND:${toICSStamp(event.end)}`,
    fold(`SUMMARY:${esc(eventTitle(event))}`),
    fold(`DESCRIPTION:${esc(`${event.description}\n\nDress code: ${event.dressCode}`)}`),
    fold(`LOCATION:${esc(`${event.venue}, ${event.address}`)}`),
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    fold(`DESCRIPTION:${esc(`${event.name} is tomorrow`)}`),
    'END:VALARM',
    'END:VEVENT',
  ])

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mahipal & Niharika//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...body,
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Trigger a client-side download of an .ics file. */
export function downloadICS(events: WeddingEvent[], filename: string) {
  const blob = new Blob([buildICS(events)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoke on the next tick — Safari needs the URL to survive the click.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function googleCalendarUrl(event: WeddingEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(event),
    dates: `${toICSStamp(event.start)}/${toICSStamp(event.end)}`,
    details: `${event.description}\n\nDress code: ${event.dressCode}`,
    location: `${event.venue}, ${event.address}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
