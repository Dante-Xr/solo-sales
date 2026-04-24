"use client"

import { ReactNode, useEffect } from "react"
import { useViewportModeStore } from "@/stores/useViewportModeStore"

export function ViewportWrapper({ children }: { children: ReactNode }) {
  const { mode } = useViewportModeStore()

  useEffect(() => {
    if (mode === "mobile") {
      const meta = document.querySelector('meta[name="viewport"]')
      if (meta) {
        meta.setAttribute("content", "width=375, initial-scale=1, maximum-scale=1")
      }
    } else {
      const meta = document.querySelector('meta[name="viewport"]')
      if (meta) {
        meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=5")
      }
    }
  }, [mode])

  if (mode === "mobile") {
    return (
      <div data-viewport="mobile" className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return <>{children}</>
}
