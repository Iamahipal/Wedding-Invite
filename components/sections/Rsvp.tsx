'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  contact,
  copy,
  couple,
  dressCodePalette,
  venues,
  weddingDateDisplay,
  type Attendance,
} from '@/data/wedding'
import { isRsvpConfigured, submitRsvp, validateRsvp, type ValidationErrors } from '@/lib/sheets'
import { useUiStore } from '@/lib/uiStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { RevealText, Reveal } from '@/components/ui/RevealText'
import { Countdown } from '@/components/ui/Countdown'
import { Divider } from '@/components/ui/Ornament'
import { Scrim } from '@/components/ui/Scrim'

type Status = 'idle' | 'sending' | 'done' | 'error'

const fieldClass =
  'w-full rounded-lg border border-ivory/15 bg-midnight/40 px-4 py-3 font-body text-sm text-ivory ' +
  'placeholder:text-ivory/25 transition-colors duration-300 focus:border-gold/60 focus:outline-none'

export function Rsvp() {
  const guestName = useUiStore((state) => state.guestName)

  const [name, setName] = useState('')
  const [attending, setAttending] = useState<Attendance>('yes')
  const [guests, setGuests] = useState(1)
  const [dietary, setDietary] = useState('')
  const [message, setMessage] = useState('')

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')

  // Pre-fill from a personalised link — one less thing for the guest to type.
  useEffect(() => {
    if (guestName) setName((current) => current || guestName)
  }, [guestName])

  async function handleSubmit(fEvent: FormEvent<HTMLFormElement>) {
    fEvent.preventDefault()

    const payload = {
      name,
      attending,
      guests: attending === 'yes' ? guests : 0,
      dietary,
      message,
      invitedAs: guestName ?? '',
    }

    const found = validateRsvp(payload)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users
      // aren't left guessing why nothing happened.
      const firstKey = Object.keys(found)[0]
      document.getElementById(`rsvp-${firstKey}`)?.focus()
      return
    }

    setStatus('sending')
    const result = await submitRsvp(payload)

    if (result.ok) {
      setStatus('done')
    } else {
      setServerError(result.error)
      setStatus('error')
    }
  }

  return (
    <section
      data-scene="rsvp"
      id="rsvp"
      className="relative px-5 py-28 sm:px-8 lg:py-36"
      aria-label="Details and RSVP"
    >
      <Scrim intensity={0.75} className="h-[70vh]" />

      <div className="relative mx-auto max-w-6xl">
        <header className="text-center">
          <Reveal>
            <Countdown className="mb-16" />
            <p className="tracking-luxe text-[0.58rem] text-gold/75 sm:text-[0.68rem]">
              {copy.rsvp.eyebrow}
            </p>
          </Reveal>

          <RevealText
            text={copy.rsvp.title}
            as="h2"
            by="char"
            delay={0.12}
            className="text-gilded mt-6 block font-display text-[clamp(2rem,7vw,4.25rem)] leading-tight font-light"
          />

          <Reveal delay={0.25}>
            <p className="mx-auto mt-7 max-w-lg font-body text-sm leading-relaxed text-ivory/60">
              {copy.rsvp.body}
            </p>
            <Divider variant="mandana" className="mt-12" />
          </Reveal>
        </header>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.85fr_1fr] lg:gap-8">
          {/* ── Details ──────────────────────────────────────────────────── */}
          <Reveal>
            {/*
              `strong`, not the lighter default. This card scrolls directly
              past the finale centrepiece, and at 4% white fill the gold read
              straight through the venue addresses. The timeline cards can
              stay light because they only ever sit over the dark starfield.
            */}
            <GlassCard variant="strong" className="h-full p-7 sm:p-9" flourish>
              <h3 className="font-display text-2xl font-light text-champagne">Where to find us</h3>

              <ul className="mt-7 space-y-6">
                {Object.entries(venues).map(([key, venue]) => (
                  <li key={key}>
                    <p className="font-display text-lg font-light text-ivory">{venue.name}</p>
                    <p className="mt-1.5 font-body text-[0.76rem] leading-relaxed text-ivory/50">
                      {venue.address}
                    </p>
                    <a
                      href={venue.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracking-luxe mt-2.5 inline-block text-[0.52rem] text-gold/80 underline-offset-4 transition-colors duration-300 hover:text-champagne hover:underline"
                    >
                      Open in maps ↗
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-9 border-t border-ivory/10 pt-7">
                <h4 className="tracking-luxe text-[0.55rem] text-gold/70">Dress code palette</h4>
                <p className="mt-3 font-body text-[0.76rem] leading-relaxed text-ivory/55">
                  Indian festive. If you&apos;d like to match the celebration, these are the
                  colours we&apos;re building it around.
                </p>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {dressCodePalette.map((swatch) => (
                    <li key={swatch.hex} className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-6 w-6 rounded-full ring-1 ring-ivory/20"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span className="font-body text-[0.62rem] text-ivory/50">{swatch.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-9 border-t border-ivory/10 pt-7 font-body text-[0.72rem] leading-relaxed text-ivory/40">
                Please reply by{' '}
                <span className="text-champagne/80">{copy.rsvp.deadline}</span>. Any questions at
                all, message us on{' '}
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/80 underline underline-offset-4 hover:text-champagne"
                >
                  {contact.whatsappDisplay}
                </a>
                .
              </p>
            </GlassCard>
          </Reveal>

          {/* ── The form ─────────────────────────────────────────────────── */}
          <Reveal delay={0.12}>
            <GlassCard variant="strong" className="h-full p-7 sm:p-9">
              <AnimatePresence mode="wait">
                {status === 'done' ? (
                  <motion.div
                    key="done"
                    className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span aria-hidden className="font-display text-5xl text-gold">
                      ✦
                    </span>
                    <h3 className="mt-6 font-display text-3xl font-light text-champagne">
                      {attending === 'yes' ? 'We can’t wait to see you' : 'Thank you for letting us know'}
                    </h3>
                    <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-ivory/55">
                      {attending === 'yes'
                        ? `Your RSVP is in, ${name.split(' ')[0]}. We'll be in touch closer to the date with everything you need.`
                        : `We'll miss you, ${name.split(' ')[0]} — but thank you for telling us. We'll raise a glass to you.`}
                    </p>
                    {!isRsvpConfigured() && (
                      <p className="mt-6 max-w-sm font-body text-[0.62rem] leading-relaxed text-marigold/70">
                        Developer note: NEXT_PUBLIC_RSVP_ENDPOINT isn&apos;t set, so this response
                        was logged to the console rather than saved. See README § RSVP.
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-2xl font-light text-champagne">
                      Your reply
                    </h3>

                    {/* Name */}
                    <div>
                      <label
                        htmlFor="rsvp-name"
                        className="tracking-luxe mb-2.5 block text-[0.55rem] text-ivory/55"
                      >
                        Your name
                      </label>
                      <input
                        id="rsvp-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(changeEvent) => setName(changeEvent.target.value)}
                        placeholder="Ravi Sharma"
                        className={fieldClass}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
                        required
                      />
                      {errors.name && (
                        <p id="rsvp-name-error" role="alert" className="mt-2 text-[0.68rem] text-rosegold">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Attending */}
                    <fieldset>
                      <legend className="tracking-luxe mb-2.5 block text-[0.55rem] text-ivory/55">
                        Will you join us?
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            ['yes', 'Joyfully accept'],
                            ['no', 'Regretfully decline'],
                          ] as const
                        ).map(([value, label]) => (
                          <label
                            key={value}
                            className={[
                              'cursor-pointer rounded-lg border px-4 py-3.5 text-center font-body text-[0.72rem]',
                              'transition-colors duration-300',
                              attending === value
                                ? 'border-gold/60 bg-gold/10 text-champagne'
                                : 'border-ivory/15 text-ivory/50 hover:border-ivory/30',
                            ].join(' ')}
                          >
                            <input
                              type="radio"
                              name="attending"
                              value={value}
                              checked={attending === value}
                              onChange={() => setAttending(value)}
                              className="sr-only"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Guest count — only meaningful if they're coming. */}
                    <AnimatePresence initial={false}>
                      {attending === 'yes' && (
                        <motion.div
                          key="guests"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <label
                            htmlFor="rsvp-guests"
                            className="tracking-luxe mb-2.5 block text-[0.55rem] text-ivory/55"
                          >
                            How many of you, including yourself?
                          </label>
                          <input
                            id="rsvp-guests"
                            name="guests"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={12}
                            value={guests}
                            onChange={(changeEvent) =>
                              setGuests(Number(changeEvent.target.value) || 1)
                            }
                            className={fieldClass}
                            aria-invalid={!!errors.guests}
                            aria-describedby={errors.guests ? 'rsvp-guests-error' : undefined}
                          />
                          {errors.guests && (
                            <p
                              id="rsvp-guests-error"
                              role="alert"
                              className="mt-2 text-[0.68rem] text-rosegold"
                            >
                              {errors.guests}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Dietary */}
                    <div>
                      <label
                        htmlFor="rsvp-dietary"
                        className="tracking-luxe mb-2.5 block text-[0.55rem] text-ivory/55"
                      >
                        Anything we should know? <span className="text-ivory/30">(optional)</span>
                      </label>
                      <textarea
                        id="rsvp-dietary"
                        name="dietary"
                        rows={2}
                        value={dietary}
                        onChange={(changeEvent) => setDietary(changeEvent.target.value)}
                        placeholder="Jain, vegan, allergies, accessibility needs…"
                        className={`${fieldClass} resize-none`}
                        aria-invalid={!!errors.dietary}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="rsvp-message"
                        className="tracking-luxe mb-2.5 block text-[0.55rem] text-ivory/55"
                      >
                        A note for us <span className="text-ivory/30">(optional)</span>
                      </label>
                      <textarea
                        id="rsvp-message"
                        name="message"
                        rows={3}
                        value={message}
                        onChange={(changeEvent) => setMessage(changeEvent.target.value)}
                        placeholder="Blessings, advice, or your song request for the sangeet…"
                        className={`${fieldClass} resize-none`}
                        aria-invalid={!!errors.message}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="tracking-luxe group relative w-full py-4 text-[0.62rem] text-champagne disabled:opacity-50"
                    >
                      <span className="absolute inset-0 rounded-full border border-gold/40 transition-colors duration-500 group-hover:border-gold group-disabled:border-gold/20" />
                      <span className="absolute inset-0 rounded-full bg-gold/0 transition-colors duration-500 group-hover:bg-gold/10" />
                      <span className="relative">
                        {status === 'sending' ? 'Sending…' : 'Send our reply'}
                      </span>
                    </button>

                    <p aria-live="polite" className="min-h-[1rem] text-center">
                      {status === 'error' && (
                        <span className="text-[0.68rem] text-rosegold">
                          {serverError} You can also{' '}
                          <a
                            href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4"
                          >
                            WhatsApp us instead
                          </a>
                          .
                        </span>
                      )}
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </GlassCard>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <p className="mt-16 text-center font-display text-lg font-light text-ivory/40 italic">
            {couple.groom.firstName} &amp; {couple.bride.firstName} · {weddingDateDisplay.short}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
