'use client'

import { CornerFlourish } from './Ornament'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  /** `strong` is darker and more opaque — use it behind form fields and body copy. */
  variant?: 'default' | 'strong'
  /** Adds the mandana corner flourishes. Off for small cards. */
  flourish?: boolean
  /** Lifts and sweeps a gold highlight across the border on hover. */
  interactive?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  flourish = false,
  interactive = false,
  as: Tag = 'div',
}: GlassCardProps) {
  return (
    <Tag
      className={[
        variant === 'strong' ? 'glass-strong' : 'glass',
        'grain rounded-2xl',
        interactive &&
          // Only transform and opacity animate. Animating backdrop-filter
          // forces the compositor to re-blur every frame and will drop a
          // mid-range phone to single-digit FPS.
          'group transition-transform duration-500 ease-[var(--ease-luxe)] will-change-transform hover:-translate-y-1',
        'relative overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {interactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'linear-gradient(120deg, transparent 20%, rgba(239,217,168,0.10) 48%, transparent 76%)',
          }}
        />
      )}

      {flourish && (
        <>
          <CornerFlourish className="pointer-events-none absolute left-3 top-3 text-gold/50" />
          <CornerFlourish className="pointer-events-none absolute right-3 top-3 text-gold/50" flip />
        </>
      )}

      <div className="relative">{children}</div>
    </Tag>
  )
}
