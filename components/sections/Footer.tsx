'use client'

import { copy, couple, weddingDateDisplay } from '@/data/wedding'
import { Reveal } from '@/components/ui/RevealText'
import { Monogram, Divider } from '@/components/ui/Ornament'

export function Footer() {
  return (
    <footer className="relative px-6 pt-16 pb-20 text-center">
      <Reveal>
        <Monogram className="mx-auto h-16 w-16 text-gold/70" />

        <Divider variant="chikankari" className="mt-10" />

        <p className="mt-10 font-display text-xl leading-relaxed font-light text-ivory/70 italic sm:text-2xl">
          {copy.footer.signoff}
        </p>

        <p className="mt-7 font-body text-[0.66rem] leading-relaxed tracking-[0.18em] text-ivory/35 uppercase">
          {copy.footer.blessing}
        </p>

        <p className="tracking-luxe mt-12 text-[0.58rem] text-gold/60">{couple.hashtag}</p>

        <p className="mt-4 font-body text-[0.58rem] text-ivory/20">
          {couple.groom.firstName} &amp; {couple.bride.firstName} · {weddingDateDisplay.full} ·{' '}
          {weddingDateDisplay.city}
        </p>
      </Reveal>
    </footer>
  )
}
