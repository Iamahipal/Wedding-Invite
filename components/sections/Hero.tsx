'use client'

import { motion } from 'motion/react'
import { couple, weddingDateDisplay } from '@/data/wedding'
import { useUiStore } from '@/lib/uiStore'
import { RevealText } from '@/components/ui/RevealText'
import { ScrollCue } from '@/components/ui/ScrollCue'
import { Divider } from '@/components/ui/Ornament'
import { Scrim } from '@/components/ui/Scrim'

export function Hero() {
  const guestName = useUiStore((state) => state.guestName)
  const entered = useUiStore((state) => state.entered)

  return (
    <section
      data-scene="hero"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-24 text-center"
      aria-label="Introduction"
    >
      <Scrim />

      {/*
        Devanagari watermark. Set in the actual Hindi spellings of their names
        rather than a transliteration — it sits behind the Latin type as
        texture, so it can be large and quiet at the same time.
      */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-deva text-[19vw] leading-none text-ivory/[0.035] sm:text-[13vw]"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={entered ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 2.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {couple.groom.nameHi} · {couple.bride.nameHi}
      </motion.span>

      <div className="relative">
        {/* Personalised greeting — only rendered when ?guest= is present. */}
        {guestName && (
          <motion.p
            className="mb-7 font-display text-lg font-light text-champagne/85 italic sm:text-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Dear {guestName},
          </motion.p>
        )}

        <motion.p
          className="tracking-luxe text-[0.58rem] text-gold/75 sm:text-[0.7rem]"
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.3 }}
        >
          Together with our families
        </motion.p>

        <h1 className="mt-7 flex flex-col items-center gap-1 sm:gap-2">
          <RevealText
            text={couple.groom.firstName}
            by="char"
            delay={0.55}
            className="text-gilded block font-display text-[clamp(2.75rem,13vw,8.5rem)] leading-[0.95] font-light"
          />
          <motion.span
            aria-hidden
            className="my-1 block font-display text-2xl font-light text-gold/60 sm:my-2 sm:text-4xl"
            initial={{ opacity: 0, rotate: -20, scale: 0.6 }}
            animate={entered ? { opacity: 1, rotate: 0, scale: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            &amp;
          </motion.span>
          <RevealText
            text={couple.bride.firstName}
            by="char"
            delay={1.05}
            className="text-gilded block font-display text-[clamp(2.75rem,13vw,8.5rem)] leading-[0.95] font-light"
          />
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 1.6, delay: 1.6 }}
        >
          <Divider variant="mandana" className="mt-10" />

          <p className="mt-8 font-body text-[0.7rem] tracking-[0.32em] text-ivory/65 uppercase sm:text-sm">
            {weddingDateDisplay.day} · {weddingDateDisplay.full}
          </p>
          <p className="mt-3 font-body text-[0.62rem] tracking-[0.22em] text-ivory/35 uppercase sm:text-xs">
            {weddingDateDisplay.city}
          </p>
        </motion.div>
      </div>

      <ScrollCue className="absolute bottom-10 left-1/2 -translate-x-1/2" />
    </section>
  )
}
