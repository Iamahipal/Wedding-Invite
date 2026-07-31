'use client'

import { useEffect } from 'react'
import { readGuestFromLocation } from '@/lib/guest'
import { useUiStore } from '@/lib/uiStore'
import { ScrollProvider } from './ScrollProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setGuestName = useUiStore((state) => state.setGuestName)

  // Read `?guest=` on the client only. Doing it during render would either
  // break static generation or produce a hydration mismatch, since the server
  // has no idea which personalised link was opened.
  useEffect(() => {
    setGuestName(readGuestFromLocation())
  }, [setGuestName])

  return <ScrollProvider>{children}</ScrollProvider>
}
