"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "solo_theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system" as Theme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light" as "light" | "dark")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (saved && ["light", "dark", "system"].includes(saved)) {
        setThemeState(saved)
      }
    } catch (e) {
      console.error("Failed to load theme preference", e)
    }

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setResolvedTheme(isDark ? "dark" : "light")
    setIsInitialized(true)
  }, [theme])

  useEffect(() => {
    if (typeof window === "undefined" || !isInitialized) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const updateResolvedTheme = () => {
      const isDark = theme === "dark" || (theme === "system" && mediaQuery.matches)
      setResolvedTheme(isDark ? "dark" : "light")
      document.documentElement.classList.toggle("dark", isDark)
    }

    updateResolvedTheme()

    mediaQuery.addEventListener("change", updateResolvedTheme)
    return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
  }, [theme, isInitialized])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (e) {
      console.error("Failed to save theme preference", e)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
