"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { Language, t as translate } from "@/i18n/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = "solo_language_preference"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
      if (saved === "zh" || saved === "en") {
        setLanguageState(saved)
      }
    } catch (e) {
      console.error("Failed to load language preference", e)
    }
  }, [mounted])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch (e) {
      console.error("Failed to save language preference", e)
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "zh" ? "en" : "zh")
  }, [language, setLanguage])

  const t = useCallback((key: string): string => {
    return translate(key, language)
  }, [language])

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
