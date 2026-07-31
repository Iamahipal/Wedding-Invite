'use client'

import Image from 'next/image'
import { copy, gallery } from '@/data/wedding'
import { getSettings } from '@/lib/quality'
import { useUiStore } from '@/lib/uiStore'
import { RevealText, Reveal } from '@/components/ui/RevealText'
import { Divider } from '@/components/ui/Ornament'

/**
 * Two completely different galleries, chosen by device capability.
 *
 * HIGH TIER — the photos live in 3D (see GalleryWall.tsx): framed planes
 *   flanking the camera as it flies down the corridor. This section then
 *   carries only the heading, so nothing competes with them.
 *
 * EVERYTHING ELSE — a native horizontal snap-scroller. Zero GPU cost, and on
 *   a phone it is genuinely the better interaction: your thumb is already
 *   there. Chasing the 3D version onto low-end hardware would buy a worse
 *   experience at a higher price.
 */
export function Gallery() {
  const tier = useUiStore((state) => state.tier)
  const reducedMotion = useUiStore((state) => state.reducedMotion)
  const use3d = getSettings(tier).gallery3d && !reducedMotion

  return (
    <section
      data-scene="gallery"
      className={`relative px-5 sm:px-8 ${use3d ? 'min-h-[130vh] py-32' : 'py-28'}`}
      aria-label="Photographs"
    >
      <header className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="tracking-luxe text-[0.58rem] text-gold/75 sm:text-[0.68rem]">
            {copy.gallery.eyebrow}
          </p>
        </Reveal>

        <RevealText
          text={copy.gallery.title}
          as="h2"
          by="word"
          delay={0.12}
          className="text-gilded mt-6 block font-display text-[clamp(1.9rem,6.5vw,3.75rem)] leading-tight font-light"
        />

        <Reveal delay={0.25}>
          <Divider variant="chikankari" className="mt-10" />
        </Reveal>
      </header>

      {use3d ? (
        <Reveal delay={0.4} className="mt-16 text-center">
          <p className="tracking-luxe text-[0.55rem] text-ivory/30">
            Keep scrolling — they&apos;re all around you
          </p>
        </Reveal>
      ) : (
        <div className="mt-14">
          {/*
            Negative margins let the rail bleed to the screen edges while the
            heading above stays within the page gutter — so the first and last
            photos peek in from off-screen and the row reads as scrollable
            without needing a scrollbar.
          */}
          <ul
            className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:gap-6 sm:px-8"
            style={{ scrollbarWidth: 'thin' }}
          >
            {gallery.map((item, index) => (
              <li
                key={item.src}
                className="w-[78vw] shrink-0 snap-center sm:w-[52vw] md:w-[38vw] lg:w-[30vw]"
              >
                <figure className="glass grain overflow-hidden rounded-2xl p-2">
                  <div className="relative aspect-3/2 overflow-hidden rounded-xl">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 30vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>
                  <figcaption className="tracking-luxe px-2 py-3.5 text-center text-[0.52rem] text-ivory/50">
                    {item.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <p className="tracking-luxe mt-2 text-center text-[0.5rem] text-ivory/25">
            Swipe to see more
          </p>
        </div>
      )}
    </section>
  )
}
