"use client"

import { DirectionProvider } from "@radix-ui/react-direction"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  // Radix primitives default to LTR; the whole app is Persian (RTL).
  return (
    <DirectionProvider dir="rtl">
      {children}
      <Toaster position="top-center" richColors dir="rtl" />
    </DirectionProvider>
  )
}
