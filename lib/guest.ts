/**
 * Personalised invitation links.
 *
 *   https://your-site.com/?guest=Ravi%20Sharma
 *
 * renders "Dear Ravi Sharma," in the hero and pre-fills the RSVP name field.
 * Sent 1:1 on WhatsApp, this lands far better than a generic link.
 *
 * The value comes straight off the URL, so it is untrusted input. React
 * escapes it on render, but we still normalise hard: strip anything that
 * isn't a letter/space/hyphen/apostrophe, cap the length, and title-case it.
 */

const MAX_LENGTH = 40

export function sanitizeGuestName(raw: string | null | undefined): string | null {
  if (!raw) return null

  const cleaned = raw
    .normalize('NFC')
    // Letters (incl. Devanagari and accents), spaces, hyphens, apostrophes, dots.
    .replace(/[^\p{L}\p{M}\s'’.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LENGTH)

  if (cleaned.length < 2) return null

  return cleaned
    .split(' ')
    .map((word) =>
      word.length <= 2 && word === word.toUpperCase()
        ? word // keep initials like "KC" as-is
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

/** Read `?guest=` from the current URL. Returns null during SSR. */
export function readGuestFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return sanitizeGuestName(params.get('guest'))
}

/** Build a personalised link to share. Handy for a future admin page. */
export function buildGuestLink(baseUrl: string, guestName: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('guest', guestName)
  return url.toString()
}
