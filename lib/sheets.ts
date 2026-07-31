import type { Attendance } from '@/data/wedding'

export interface RsvpPayload {
  name: string
  attending: Attendance
  guests: number
  dietary: string
  message: string
  /** The `?guest=` slug the invitation was opened with, if any. */
  invitedAs: string
}

export type RsvpResult =
  | { ok: true; mode: 'sent' | 'opaque' | 'local' }
  | { ok: false; error: string }

const ENDPOINT = process.env.NEXT_PUBLIC_RSVP_ENDPOINT?.trim() ?? ''

export function isRsvpConfigured(): boolean {
  return ENDPOINT.length > 0
}

export interface ValidationErrors {
  name?: string
  guests?: string
  dietary?: string
  message?: string
}

export function validateRsvp(payload: RsvpPayload): ValidationErrors {
  const errors: ValidationErrors = {}

  const name = payload.name.trim()
  if (name.length < 2) errors.name = 'Please tell us your name'
  else if (name.length > 80) errors.name = 'That name is a little too long'

  if (payload.attending === 'yes') {
    if (!Number.isInteger(payload.guests) || payload.guests < 1) {
      errors.guests = 'At least one of you, we hope'
    } else if (payload.guests > 12) {
      errors.guests = 'For parties over 12, please message us directly'
    }
  }

  if (payload.dietary.length > 300) errors.dietary = 'Please keep this under 300 characters'
  if (payload.message.length > 800) errors.message = 'Please keep this under 800 characters'

  return errors
}

/**
 * POST the RSVP to a Google Apps Script Web App.
 *
 * Two deliberate quirks:
 *
 * 1. `Content-Type: text/plain` — this keeps the request "simple" so the
 *    browser skips the CORS preflight. Apps Script does not answer OPTIONS,
 *    so an `application/json` body would fail before it ever left the tab.
 *
 * 2. If the CORS read still fails (Apps Script 302-redirects to
 *    googleusercontent.com, and some browser/extension combinations block
 *    reading that), we retry with `mode: 'no-cors'`. The response is opaque
 *    so we cannot confirm — but the row does land in the Sheet. We report
 *    `mode: 'opaque'` so the UI can word the confirmation honestly.
 */
export async function submitRsvp(payload: RsvpPayload): Promise<RsvpResult> {
  const body = JSON.stringify({
    ...payload,
    name: payload.name.trim(),
    dietary: payload.dietary.trim(),
    message: payload.message.trim(),
    submittedAt: new Date().toISOString(),
  })

  if (!ENDPOINT) {
    // Development / not-yet-configured: don't fail the guest, just log it.
    console.info('[RSVP] NEXT_PUBLIC_RSVP_ENDPOINT is not set. Payload:', payload)
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { ok: true, mode: 'local' }
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
    })

    if (!response.ok) {
      return { ok: false, error: `The server replied ${response.status}.` }
    }
    return { ok: true, mode: 'sent' }
  } catch {
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      })
      return { ok: true, mode: 'opaque' }
    } catch {
      return {
        ok: false,
        error: 'We could not reach the server. Please check your connection.',
      }
    }
  }
}
