import { create } from 'zustand'
import type { QualityTier } from './quality'

/**
 * Small, low-frequency UI state only.
 *
 * Nothing here updates per-frame — scroll position deliberately lives in
 * `scrollStore.ts` as a plain mutable object so it never triggers a render.
 */
interface UiState {
  /** Has the guest pressed "Enter"? Also the gesture that unlocks audio. */
  entered: boolean
  /** Have the 3D assets finished loading? */
  ready: boolean
  audioOn: boolean
  tier: QualityTier
  reducedMotion: boolean
  guestName: string | null

  enter: () => void
  setReady: (ready: boolean) => void
  toggleAudio: () => void
  setTier: (tier: QualityTier) => void
  setReducedMotion: (reduced: boolean) => void
  setGuestName: (name: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  entered: false,
  ready: false,
  audioOn: false,
  tier: 'mid',
  reducedMotion: false,
  guestName: null,

  enter: () => set({ entered: true }),
  setReady: (ready) => set({ ready }),
  toggleAudio: () => set((state) => ({ audioOn: !state.audioOn })),
  setTier: (tier) => set({ tier }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setGuestName: (guestName) => set({ guestName }),
}))
