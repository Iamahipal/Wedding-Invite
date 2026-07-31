'use client'

import { useRef, type ElementType } from 'react'
import { motion, useInView } from 'motion/react'

/**
 * Staggered text reveals.
 *
 * The text is split in React rather than by a DOM-mutating plugin, which
 * means it survives hydration, re-renders and font swaps without re-measuring.
 *
 * Accessibility: the split fragments are `aria-hidden` and the whole string is
 * exposed once via `aria-label`. Without that, a screen reader announces
 * "M... a... h... i..." one letter at a time.
 */

interface RevealTextProps {
  text: string
  as?: ElementType
  by?: 'char' | 'word'
  className?: string
  delay?: number
  /** Per-fragment stagger, seconds. Lower for long strings. */
  stagger?: number
  once?: boolean
}

export function RevealText({
  text,
  as: Tag = 'span',
  by = 'word',
  className = '',
  delay = 0,
  stagger,
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once, margin: '-12% 0px -12% 0px' })

  const fragments = by === 'char' ? Array.from(text) : text.split(' ')
  const step = stagger ?? (by === 'char' ? 0.018 : 0.055)

  const MotionTag = motion.create(Tag)

  return (
    <MotionTag ref={ref} className={className} aria-label={text}>
      {fragments.map((fragment, index) => (
        <span
          key={`${fragment}-${index}`}
          aria-hidden
          // inline-block is required for transforms to apply; the extra wrapper
          // gives us a clip edge so glyphs rise out of nothing.
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{
              duration: 0.9,
              delay: delay + index * step,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {fragment === ' ' ? ' ' : fragment}
            {by === 'word' && index < fragments.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}

/** A block-level fade-and-rise, for anything that isn't a headline. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 28,
  once = true,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-10% 0px -10% 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
