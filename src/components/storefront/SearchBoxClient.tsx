"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { Input } from "@/components/ui/input"
import { Search, X, History, Flame } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

const MAX_HISTORY = 3

const DEFAULT_HOT_TERMS = {
  zh: ["#网红爆款", "#限时秒杀", "#抖音同款", "#ins风"],
  en: ["#trending", "#flashsale", "#viral", "#mustbuy"],
}

interface SearchBoxClientProps {
  onSearch?: (query: string) => void
}

export function SearchBoxClient({ onSearch }: SearchBoxClientProps) {
  const router = useRouter()
  const t = useTranslations('nav')
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [hotTerms, setHotTerms] = useState<string[]>([])
  const [_loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("solo_search_history_v2")
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error(t('searchPlaceholder'), e)
    }
  }, [t])

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/search/trending")
        const data = await res.json()
        const terms = locale === "zh" ? data.zh : data.en
        setHotTerms(terms)
      } catch {
        setHotTerms(locale === "zh" ? DEFAULT_HOT_TERMS.zh : DEFAULT_HOT_TERMS.en)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [locale])

  const saveHistory = (newHistory: string[]) => {
    try {
      localStorage.setItem("solo_search_history_v2", JSON.stringify(newHistory))
      setHistory(newHistory)
    } catch (e) {
      console.error(t('searchPlaceholder'), e)
    }
  }

  const performSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    const newHistory = [trimmedQuery, ...history.filter(h => h !== trimmedQuery)].slice(0, MAX_HISTORY)
    saveHistory(newHistory)

    onSearch?.(trimmedQuery)

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    setShowHistory(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch(query)
    }
  }

  const selectFromHistory = (item: string) => {
    performSearch(item)
  }

  const clearHistory = () => {
    saveHistory([])
  }

  return (
    <div className="relative w-full lg:max-w-[600px] lg:mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showHistory && (history.length > 0 || hotTerms.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="w-4 h-4" />
                  <span>{t("searchHistory")}</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("clear")}
                </button>
              </div>

              <div className="py-1">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => selectFromHistory(item)}
                  >
                    <History className="w-3 h-3 text-muted-foreground mr-2 flex-shrink-0" />
                    <span className="text-sm truncate text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {hotTerms.length > 0 && (
            <div className="border-t border-border">
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{t("hotSearch")}</span>
              </div>
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {hotTerms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => selectFromHistory(term)}
                    className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded-full text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
