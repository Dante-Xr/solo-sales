"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactNode } from "react"

if (typeof window !== "undefined") {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return
    }
    originalError.call(console, ...args)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  )
}

export { useTheme } from "next-themes"
