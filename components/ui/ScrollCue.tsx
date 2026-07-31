'use client'

import { motion } from 'motion/react'
import { copy } from '@/data/wedding'

/** The one instruction the whole site needs. */
export function ScrollCue({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex flex-col items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 1.8, ease: 'easeOut' }}
    >
      <span className="tracking-luxe text-[0.55rem] text-ivory/50 sm:text-[0.62rem]">
        {copy.scrollCue}
      </span>

      {/* A mote falling down a thread — quieter than a bouncing chevron. */}
      <span className="relative block h-12 w-px overflow-hidden bg-gradient-to-b from-gold/40 to-transparent">
        <motion.span
          className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold"
          style={{ boxShadow: '0 0 12px 2px rgba(212,168,87,0.6)' }}
          animate={{ y: [-8, 48], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.7, 1] }}
        />
      </span>
    </motion.div>
  )
}
