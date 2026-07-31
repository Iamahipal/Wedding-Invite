'use client'

import { copy, couple } from '@/data/wedding'
import { RevealText, Reveal } from '@/components/ui/RevealText'
import { Divider } from '@/components/ui/Ornament'
import { Scrim } from '@/components/ui/Scrim'

/**
 * Two beats, two DOM blocks.
 *
 * `approach` — the camera closes on the ring while the invocation appears.
 * `through`  — the camera passes through it as the invitation itself reads.
 *
 * They're separate elements because `measureScenes()` reads their real
 * positions to time the camera. Splitting the copy this way is also just
 * better writing: the invocation gets its own silence before the ask.
 */
export function Invitation() {
  return (
    <>
      <section
        data-scene="approach"
        className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 text-center"
        aria-label="Invocation"
      >
        <Scrim intensity={0.85} />
        <Reveal>
          <p className="font-deva text-2xl leading-relaxed text-gold sm:text-4xl">
            {copy.invocation}
          </p>
          <p className="tracking-luxe mt-5 text-[0.55rem] text-ivory/35 sm:text-[0.62rem]">
            {copy.invocationTranslit}
          </p>
        </Reveal>
      </section>

      <section
        data-scene="through"
        className="relative flex min-h-[95vh] flex-col items-center justify-center px-6 text-center"
        aria-label="The invitation"
      >
        {/* Strongest scrim on the page — this is where the camera is inside
            the ring and the frame is at its brightest. */}
        <Scrim intensity={0.88} />
        <div className="relative max-w-2xl">
          <Reveal>
            <p className="tracking-luxe text-[0.58rem] text-gold/75 sm:text-[0.68rem]">
              {copy.invitation.eyebrow}
            </p>
          </Reveal>

          <RevealText
            text={copy.invitation.body}
            as="p"
            by="word"
            stagger={0.032}
            className="mt-9 font-display text-[clamp(1.45rem,4.6vw,2.9rem)] leading-[1.35] font-light text-ivory/90"
          />

          <Reveal delay={0.35}>
            <Divider variant="chikankari" className="mt-12" />

            <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-14">
              <div>
                <p className="font-display text-xl font-light text-champagne sm:text-2xl">
                  {couple.groom.fullName}
                </p>
                <p className="mt-2 font-body text-[0.6rem] tracking-[0.2em] text-ivory/40 uppercase">
                  {couple.groom.parents}
                </p>
              </div>

              <span aria-hidden className="hidden h-10 w-px bg-gold/20 sm:block" />

              <div>
                <p className="font-display text-xl font-light text-champagne sm:text-2xl">
                  {couple.bride.fullName}
                </p>
                <p className="mt-2 font-body text-[0.6rem] tracking-[0.2em] text-ivory/40 uppercase">
                  {couple.bride.parents}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
