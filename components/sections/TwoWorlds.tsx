'use client'

import { copy, couple } from '@/data/wedding'
import { RevealText, Reveal } from '@/components/ui/RevealText'
import { Scrim } from '@/components/ui/Scrim'

/**
 * The cultural heart of the page.
 *
 * The 3D behind this section is doing the real work — a Rajasthani jharokha
 * and an Awadhi arch drifting together and interlocking. So the copy stays
 * deliberately short: it names what the guest is already watching happen.
 */
export function TwoWorlds() {
  return (
    <section
      data-scene="twoWorlds"
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center"
      aria-label="Two families"
    >
      <Scrim intensity={0.72} />
      <div className="relative max-w-3xl">
        <Reveal>
          <p className="tracking-luxe text-[0.58rem] text-gold/75 sm:text-[0.68rem]">
            {copy.twoWorlds.eyebrow}
          </p>
        </Reveal>

        <RevealText
          text={copy.twoWorlds.title}
          as="h2"
          by="char"
          delay={0.15}
          className="text-gilded mt-7 block font-display text-[clamp(2.1rem,8vw,5rem)] leading-[1.05] font-light"
        />

        <Reveal delay={0.3}>
          <p className="mx-auto mt-9 max-w-xl font-body text-sm leading-relaxed text-ivory/60 sm:text-base">
            {copy.twoWorlds.body}
          </p>
        </Reveal>

        {/* Two origins, held apart by a thread — echoing the arches behind. */}
        <Reveal delay={0.5}>
          <div className="mt-14 flex items-center justify-center gap-5 sm:gap-12">
            <div className="text-right">
              <p className="font-deva text-lg text-marigold/85 sm:text-2xl">
                {couple.groom.originHi}
              </p>
              <p className="tracking-luxe mt-2 text-[0.52rem] text-ivory/45 sm:text-[0.6rem]">
                {couple.groom.region}
              </p>
            </div>

            <span aria-hidden className="rule-gold w-12 shrink-0 sm:w-28" />

            <div className="text-left">
              <p className="font-deva text-lg text-champagne/85 sm:text-2xl">
                {couple.bride.originHi}
              </p>
              <p className="tracking-luxe mt-2 text-[0.52rem] text-ivory/45 sm:text-[0.6rem]">
                {couple.bride.region}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
