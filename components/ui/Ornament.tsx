'use client'

/**
 * Cultural motifs, drawn as inline SVG.
 *
 * `mandana` — the geometric chalk-and-ochre floor art painted on Rajasthani
 *   thresholds: triangles, chevrons, a lotus at the centre.
 * `chikankari` — the flowing white floral vine embroidered in Lucknow.
 *
 * Vector, so they cost nothing, scale perfectly, and tint with currentColor.
 * Used as section dividers and card corners — texture, never wallpaper.
 */

interface DividerProps {
  variant?: 'mandana' | 'chikankari' | 'simple'
  className?: string
}

export function Divider({ variant = 'simple', className = '' }: DividerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-4 text-gold/60 ${className}`}
      aria-hidden
    >
      <span className="rule-gold w-16 sm:w-28" />
      {variant === 'mandana' && <MandanaGlyph />}
      {variant === 'chikankari' && <ChikankariGlyph />}
      {variant === 'simple' && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="currentColor" />
        </svg>
      )}
      <span className="rule-gold w-16 sm:w-28" />
    </div>
  )
}

/** Rajasthan — mandana: nested triangles around a lotus core. */
function MandanaGlyph() {
  return (
    <svg width="46" height="26" viewBox="0 0 46 26" fill="none" className="shrink-0">
      <g stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" fill="none">
        <path d="M23 3 L30 13 L23 23 L16 13 Z" />
        <path d="M23 7 L27 13 L23 19 L19 13 Z" />
        <path d="M8 13 L12 9 L12 17 Z" />
        <path d="M38 13 L34 9 L34 17 Z" />
        <path d="M2 13 H7 M39 13 H44" strokeLinecap="round" />
      </g>
      <circle cx="23" cy="13" r="1.6" fill="currentColor" />
    </svg>
  )
}

/** Uttar Pradesh — chikankari: a running floral vine. */
function ChikankariGlyph() {
  return (
    <svg width="52" height="24" viewBox="0 0 52 24" fill="none" className="shrink-0">
      <path
        d="M2 12 C8 4, 14 4, 20 12 C26 20, 32 20, 38 12 C42 6, 46 6, 50 12"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="currentColor">
        <circle cx="20" cy="12" r="1.5" />
        <circle cx="38" cy="12" r="1.5" />
      </g>
      <g stroke="currentColor" strokeWidth="0.7" fill="none" strokeLinecap="round">
        <path d="M20 12 C18 8, 20 6, 22 8" />
        <path d="M38 12 C36 16, 38 18, 40 16" />
      </g>
    </svg>
  )
}

/** The interlocked monogram — used on the preloader curtain and the footer. */
export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      role="img"
      aria-label="M and N monogram"
    >
      {/* Outer ring, drawn as two arcs so it reads as hand-struck, not printed. */}
      <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
      <circle
        cx="60"
        cy="60"
        r="49"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.28"
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill="currentColor"
        style={{ font: '300 40px var(--font-display)', letterSpacing: '0.02em' }}
      >
        M
        <tspan style={{ font: '300 22px var(--font-display)' }} dy="-2">
          {' & '}
        </tspan>
        N
      </text>
    </svg>
  )
}

/** A corner flourish for glass cards — quarter of a mandana motif. */
export function CornerFlourish({
  className = '',
  flip = false,
}: {
  className?: string
  flip?: boolean
}) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M1 12 C1 5, 5 1, 12 1 M1 20 C1 9, 9 1, 20 1"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="6" cy="6" r="1.2" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
