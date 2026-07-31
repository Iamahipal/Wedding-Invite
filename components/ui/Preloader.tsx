'use client'

import { useEffect, useState } from 'react'
import { Loader, useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'
import { couple, weddingDateDisplay } from '@/data/wedding'
import { useUiStore } from '@/lib/uiStore'
import { Monogram } from './Ornament'

/**
 * The curtain.
 *
 * Progress comes from drei's loading machinery — `useProgress` for the number,
 * and drei's own `<Loader />` restyled down to a single gold hairline for the
 * bar. So this is genuinely drei's loader, wearing a better suit.
 *
 * The "Enter" button is not decoration. Browsers require a user gesture before
 * audio may play, and this is the only moment in the journey where asking for
 * one feels like part of the invitation rather than an interruption.
 */
export function Preloader() {
  const { progress } = useProgress()
  const entered = useUiStore((state) => state.entered)
  const enter = useUiStore((state) => state.enter)
  const ready = useUiStore((state) => state.ready)

  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  // A curtain that flashes past in 200ms reads as a glitch. Hold it briefly so
  // the reveal always feels deliberate — but never longer than that.
  useEffect(() => {
    const id = window.setTimeout(() => setMinTimeElapsed(true), 1400)
    return () => window.clearTimeout(id)
  }, [])

  // Don't let a stalled asset trap the guest behind the curtain forever.
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 9000)
    return () => window.clearTimeout(id)
  }, [])

  const canEnter = (ready && minTimeElapsed) || timedOut

  // Freeze the page behind the curtain — nothing is more disorienting than
  // scrolling a journey you cannot see yet.
  useEffect(() => {
    if (entered) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [entered])

  return (
    <>
      <AnimatePresence>
        {!entered && (
          <motion.div
            key="curtain"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-midnight px-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Monogram className="h-24 w-24 text-gold sm:h-28 sm:w-28" />

              <p className="tracking-luxe mt-8 text-[0.6rem] text-gold/70 sm:text-xs">
                The wedding of
              </p>

              <h1 className="mt-4 text-center font-display text-3xl font-light text-gilded sm:text-5xl">
                {couple.groom.firstName}
                <span className="mx-3 text-gold/50">&amp;</span>
                {couple.bride.firstName}
              </h1>

              <p className="mt-3 font-body text-[0.68rem] tracking-[0.25em] text-ivory/45 uppercase sm:text-xs">
                {weddingDateDisplay.full}
              </p>

              {/* Progress rail */}
              <div className="mt-10 h-px w-52 overflow-hidden bg-ivory/10 sm:w-64">
                <motion.div
                  className="h-full bg-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: Math.max(progress / 100, 0.02) }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              <div className="mt-10 h-12">
                <AnimatePresence mode="wait">
                  {canEnter ? (
                    <motion.button
                      key="enter"
                      type="button"
                      onClick={enter}
                      className="tracking-luxe group relative px-9 py-3 text-[0.65rem] text-champagne sm:text-xs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="absolute inset-0 rounded-full border border-gold/40 transition-colors duration-500 group-hover:border-gold" />
                      <span className="absolute inset-0 rounded-full bg-gold/0 transition-colors duration-500 group-hover:bg-gold/10" />
                      <span className="relative">Enter</span>
                    </motion.button>
                  ) : (
                    <motion.p
                      key="loading"
                      className="tracking-luxe pt-4 text-[0.6rem] text-ivory/35"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {Math.round(progress)}%
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <p className="absolute bottom-8 px-6 text-center font-body text-[0.6rem] text-ivory/25">
              Best experienced with sound
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        drei's own <Loader />, stripped back to a single gold hairline at the
        top of the screen. It stays after "Enter" so that anything still
        streaming in (gallery textures on a slow connection) is still reported.
      */}
      <Loader
        containerStyles={{
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 70,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
        innerStyles={{
          width: '100vw',
          height: '2px',
          background: 'rgba(245,239,227,0.08)',
        }}
        barStyles={{ height: '2px', background: '#D4A857' }}
        dataStyles={{ display: 'none' }}
      />
    </>
  )
}
