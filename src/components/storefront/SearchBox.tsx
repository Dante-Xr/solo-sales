"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X, History, Flame } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

const MAX_HISTORY = 3

const hotSearchTerms = {
  zh: ["#网红爆款", "#限时秒杀", "#抖音同款", "#ins风"],
  en: ["#trending", "#flashsale", "#viral", "#mustbuy"]
}

interface SearchBoxProps {
  onSearch: (query: string) => void
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [hotTerms, setHotTerms] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("solo_search_history_v2")
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error(t("common.loading"), e)
    }
  }, [t])

  useEffect(() => {
    setHotTerms(language === "zh" ? hotSearchTerms.zh : hotSearchTerms.en)
  }, [language])

  const saveHistory = (newHistory: string[]) => {
    try {
      localStorage.setItem("solo_search_history_v2", JSON.stringify(newHistory))
      setHistory(newHistory)
    } catch (e) {
      console.error(t("common.loading"), e)
    }
  }

  const handleSearch = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    const newHistory = [trimmedQuery, ...history.filter(h => h !== trimmedQuery)].slice(0, MAX_HISTORY)
    saveHistory(newHistory)

    onSearch(trimmedQuery)
    setShowHistory(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const selectFromHistory = (item: string) => {
    setQuery(item)
    onSearch(item)
    setShowHistory(false)
  }

  const clearHistory = () => {
    saveHistory([])
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("nav.searchPlaceholder")}
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
          {/* 搜索历史 */}
          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="w-4 h-4" />
                  <span>{t("nav.searchHistory")}</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("common.clear")}
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

          {/* 热搜词 */}
          {hotTerms.length > 0 && (
            <div className="border-t border-border">
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{t("nav.hotSearch")}</span>
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
