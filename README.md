# Mahipal ✦ Niharika

A cinematic, scroll-driven digital wedding invitation. A fixed WebGL canvas sits behind ordinary scrolling HTML; the guest's scroll position flies a camera through a gold *bandhan* knot, past a Rajasthani jharokha meeting an Awadhi arch, down a corridor of photographs, and out to the RSVP.

Built mobile-first, because that is where every guest will open it.

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## Make it yours

Everything a guest reads lives in **one file**: [`data/wedding.ts`](data/wedding.ts). Names, the date, every event, venues, dress code, gallery captions, contact numbers. Search it for `TODO` — each one marks a placeholder waiting on your real details.

You do not need to touch any component to change the content.

### The three asset swap points

| What | Where to put it | What to edit |
|---|---|---|
| **Photographs** | `public/gallery/*.png` | `gallery` array in `data/wedding.ts` — write real `alt` text, it's what screen-reader guests hear |
| **3D model** (optional) | `public/models/rings.glb` | [`components/canvas/Centrepiece.tsx`](components/canvas/Centrepiece.tsx) — instructions are in the file header |
| **Music** (optional) | `public/audio/ambient.mp3` | Nothing. [`AudioToggle`](components/ui/AudioToggle.tsx) picks it up, and hides its own button if the file is absent |

The placeholder gallery images are generated, not committed by hand — `npm run placeholders` rebuilds them.

> **Swapping the 3D model:** whatever you use must have an **open centre along the Z axis**. The camera flies straight through it at roughly 30% scroll; a solid mesh will clip the near plane and flash its own interior.

---

## RSVP → Google Sheets

Replies land in a spreadsheet you own. No vendor, no cost, no account beyond the Google one you already have.

1. Create a new Google Sheet.
2. **Extensions → Apps Script**. Delete the stub and paste all of [`scripts/rsvp-apps-script.gs`](scripts/rsvp-apps-script.gs).
3. **Deploy → New deployment → Web app**
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
4. Copy the `/exec` URL it gives you.
5. `cp .env.example .env.local` and paste it as `NEXT_PUBLIC_RSVP_ENDPOINT`.

Visit that URL directly in a browser — it should reply `{"ok":true,...}`.

Until the variable is set, the form still validates and shows its success state; submissions log to the console instead of saving, and the confirmation screen says so.

<details>
<summary>Why the client posts <code>text/plain</code></summary>

Apps Script does not answer CORS preflight `OPTIONS` requests. Sending `application/json` would make the request "non-simple", trigger a preflight, and fail before it ever left the browser. `text/plain` keeps it simple; the Apps Script side parses the body as JSON regardless. If reading the response still fails, [`lib/sheets.ts`](lib/sheets.ts) retries in `no-cors` mode — the row lands, we just can't read the reply, and the UI is worded honestly about it.
</details>

---

## Personalised links

Append a guest's name to the URL:

```
https://your-site.com/?guest=Ravi%20Sharma
```

The hero opens with *"Dear Ravi Sharma,"* and the RSVP name field is pre-filled. Sent one-to-one on WhatsApp this lands far better than a generic link — and it tells you who replied even if they typo their own name.

The value is untrusted URL input, so [`lib/guest.ts`](lib/guest.ts) strips everything that isn't a letter, space, hyphen or apostrophe, caps the length, and title-cases the result.

---

## How the scroll journey works

Two layers, and one number connecting them:

```
z-0    <SceneCanvas>   fixed, full-viewport, pointer-events: none
z-10   <main>          ordinary scrolling HTML, on top
```

**Scroll never triggers a React render.** GSAP ScrollTrigger writes page progress into a plain module-level object in [`lib/scrollStore.ts`](lib/scrollStore.ts); R3F's `useFrame` reads it. The obvious alternative — `onUpdate → setState` — re-renders the entire 3D tree sixty times a second and makes mid-range Android unusable.

Each section marks itself with `data-scene="hero" | "approach" | "through" | …`. On mount (and on every resize, and whenever a `ResizeObserver` sees the page height change) `measureScenes()` reads their true positions and turns them into the camera's keyframe timings. So the camera stays glued to the copy even after you add three more events to the itinerary — no fractions to retune by hand.

| Beat | The 3D | The words |
|---|---|---|
| Hero | Gold knot haloing the names, marigold motes | Their names, the date |
| Approach | Camera closes in, light warms indigo → champagne | `॥ श्री गणेशाय नमः ॥` |
| Through | Camera passes *through* the knot; it flares as you cross | The invitation itself |
| Two Worlds | A cusped Rajasthani jharokha and a pointed Awadhi arch converge and interlock | "Marwar meets Awadh" |
| Timeline | Petals disperse into a starfield (GPU morph, one uniform) | Six events, alternating cards |
| Gallery | Framed photos flanking the camera down a corridor | Captions only |
| RSVP | Camera pulls back; the knot re-emerges from the fog, crowning the section | Countdown, venues, dress code, the form |

---

## Performance

A wedding invitation gets opened on every phone in the family group chat, including six-year-old Androids. [`lib/quality.ts`](lib/quality.ts) picks a tier from `hardwareConcurrency`, `deviceMemory`, DPR and pointer type — pessimistically, because starting low and being promoted beats stuttering through the first five seconds. drei's `<PerformanceMonitor>` then demotes live if frames sag.

| | low | mid | high |
|---|---|---|---|
| Max DPR | 1.25 | 1.5 | 2 |
| Particles | 1 500 | 6 000 | 20 000 |
| Postprocessing | off | bloom | bloom + vignette + chromatic aberration |
| Gallery | native scroller | native scroller | 3D corridor |

Other decisions worth knowing about before you change them:

- **No shadow maps anywhere.** The luxury look comes from `Lightformer` reflections baked into an environment map once (`frames={1}`), which is far cheaper *and* looks better on polished metal.
- **Lenis runs with `syncTouch: false`.** Smoothing the wheel is nice; hijacking touch momentum is what makes these sites feel broken on a phone.
- **`backdrop-filter` is never animated.** Only `opacity` and `transform`. Re-blurring every frame will take a mid-range phone to single digits.
- **The render loop parks entirely in a background tab** (`frameloop="never"` on `visibilitychange`).
- **`prefers-reduced-motion` skips the whole camera journey** and renders a static gradient backdrop. Every word stays reachable.

---

## Deploying

Push to GitHub and import the repo on Vercel. Set `NEXT_PUBLIC_RSVP_ENDPOINT` and `NEXT_PUBLIC_SITE_URL` in the project's environment variables.

For a static host (GitHub Pages, Netlify drop) uncomment the two lines at the bottom of [`next.config.ts`](next.config.ts). You lose `next/image` optimisation and the generated share card becomes a build-time PNG.

### The share card

[`app/opengraph-image.tsx`](app/opengraph-image.tsx) generates the preview that appears when the link is pasted into WhatsApp or Instagram. Given how this invitation will actually travel, it's worth looking at before you send anything.

---

## Project layout

```
app/            layout (fonts, metadata), page, globals.css, opengraph-image
components/
  canvas/       everything 3D — camera rig, centrepiece, particles, arches, gallery, effects
  sections/     the HTML overlay, one file per beat
  ui/           glass cards, reveals, countdown, audio toggle, preloader, ornaments
  providers/    Lenis ⇄ ScrollTrigger wiring, guest-link reading
lib/            scroll store, quality tiers, calendar builders, Sheets client, guest parsing
data/           ★ wedding.ts — the only file you need to edit
scripts/        Apps Script backend, placeholder generator
```

---

## Stack

Next.js 16 · React 19 · React Three Fiber 9 · drei 10 · GSAP 3.13 (ScrollTrigger is free now) · Tailwind CSS 4 · Motion 12 · Lenis · Zustand
