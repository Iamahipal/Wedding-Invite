import { SceneCanvas } from '@/components/canvas/SceneCanvas'
import { AppProviders } from '@/components/providers/AppProviders'
import { Preloader } from '@/components/ui/Preloader'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { Hero } from '@/components/sections/Hero'
import { Invitation } from '@/components/sections/Invitation'
import { TwoWorlds } from '@/components/sections/TwoWorlds'
import { Timeline } from '@/components/sections/Timeline'
import { Gallery } from '@/components/sections/Gallery'
import { Rsvp } from '@/components/sections/Rsvp'
import { Footer } from '@/components/sections/Footer'

/**
 * The whole invitation.
 *
 * Structurally there are only two layers:
 *
 *   z-0   <SceneCanvas>  — fixed, full-viewport, pointer-events: none
 *   z-10  <main>         — ordinary scrolling HTML, on top
 *
 * The 3D never scrolls. The HTML never knows about the 3D. The only thing
 * connecting them is a single number — page scroll progress — written into
 * `lib/scrollStore.ts` by ScrollTrigger and read by `useFrame`.
 *
 * Each section carries a `data-scene` attribute. On mount those positions are
 * measured from the DOM and become the camera's keyframe timings, so the
 * camera stays glued to the copy no matter how the content grows.
 */
export default function Page() {
  return (
    <AppProviders>
      <SceneCanvas />
      <Preloader />
      <AudioToggle />

      <main className="relative z-10">
        <Hero />
        <Invitation />
        <TwoWorlds />
        <Timeline />
        <Gallery />
        <Rsvp />
        <Footer />
      </main>
    </AppProviders>
  )
}
