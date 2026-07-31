import { ImageResponse } from 'next/og'
import { couple, weddingDateDisplay } from '@/data/wedding'

/**
 * The share card.
 *
 * This is the single highest-leverage file in the project. A wedding
 * invitation gets forwarded through WhatsApp far more than it gets typed into
 * a browser, and this image is what every one of those guests sees first.
 *
 * Deliberately built from CSS rather than a photo so it stays correct before
 * any real photographs exist — swap in a background <img> once you have one.
 */

export const alt = `${couple.groom.firstName} & ${couple.bride.firstName} — Wedding Invitation`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Render once at build time into a real PNG file.
 *
 * Required for `output: 'export'` — a static host has no runtime to generate
 * the card on request, and without this the export fails outright. It's also
 * simply better here: the card never changes between requests, so paying for
 * it once at build is free.
 */
export const dynamic = 'force-static'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0E1A',
          position: 'relative',
        }}
      >
        {/* Warm glow behind the names, echoing the hero lighting. */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(212,168,87,0.20) 0%, rgba(43,76,126,0.12) 42%, rgba(10,14,26,0) 68%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            color: '#D4A857',
            fontSize: 20,
            letterSpacing: 10,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 60, height: 1, background: 'rgba(212,168,87,0.5)' }} />
          <div style={{ display: 'flex' }}>Together with our families</div>
          <div style={{ width: 60, height: 1, background: 'rgba(212,168,87,0.5)' }} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 46,
            color: '#EFD9A8',
            fontSize: 104,
            fontWeight: 300,
            letterSpacing: -1,
          }}
        >
          <div style={{ display: 'flex' }}>{couple.groom.firstName}</div>
          <div style={{ display: 'flex', margin: '0 34px', color: '#D4A857', fontSize: 62 }}>&</div>
          <div style={{ display: 'flex' }}>{couple.bride.firstName}</div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 44,
            color: 'rgba(245,239,227,0.62)',
            fontSize: 24,
            letterSpacing: 8,
            textTransform: 'uppercase',
          }}
        >
          {weddingDateDisplay.full}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 16,
            color: 'rgba(245,239,227,0.34)',
            fontSize: 18,
            letterSpacing: 5,
            textTransform: 'uppercase',
          }}
        >
          {weddingDateDisplay.city}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 46,
            display: 'flex',
            color: 'rgba(212,168,87,0.7)',
            fontSize: 17,
            letterSpacing: 6,
          }}
        >
          {couple.hashtag}
        </div>
      </div>
    ),
    size,
  )
}
