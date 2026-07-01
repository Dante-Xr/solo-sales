"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, History, Flame } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

const MAX_HISTORY = 3

const DEFAULT_HOT_TERMS = {
  zh: ["#网红爆款", "#限时秒杀", "#抖音同款", "#ins风"],
  en: ["#trending", "#flashsale", "#viral", "#mustbuy"],
}

interface SearchBoxClientProps {
  onSearch?: (query: string) => void
  /** 紧凑模式：用于导航栏内嵌 */
  compact?: boolean
}

export function SearchBoxClient({ onSearch, compact = false }: SearchBoxClientProps) {
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
    } catch {
      // Ignore localStorage errors
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
    } catch {
      // Ignore localStorage errors
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
    <div className={`relative w-full ${compact ? 'lg:max-w-[500px]' : 'lg:max-w-[600px] lg:mx-auto'}`}>
      {/* 搜索框主体 */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            className={`
              pl-10 pr-10
              ${compact ? 'h-9' : 'h-10'}
              bg-muted/50 border-muted-foreground/20
              focus:bg-background focus:border-brand/50
              transition-all duration-200
              rounded-full
            `}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 搜索按钮（仅紧凑模式显示） */}
        {compact && (
          <Button
            size="sm"
            onClick={() => performSearch(query)}
            className="rounded-full px-4 h-9 bg-brand hover:bg-brand/90 text-brand-foreground font-medium"
          >
            <Search className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">{t("search") || "搜索"}</span>
          </Button>
        )}
      </div>

      {/* 搜索历史和热门搜索下拉框 */}
      {showHistory && (history.length > 0 || (hotTerms && hotTerms.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span>{t("searchHistory")}</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("clear")}
                </button>
              </div>

              <div className="py-1">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors group"
                    onClick={() => selectFromHistory(item)}
                  >
                    <History className="w-3.5 h-3.5 text-muted-foreground mr-3 flex-shrink-0 group-hover:text-foreground transition-colors" />
                    <span className="text-sm truncate text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {hotTerms && hotTerms.length > 0 && (
            <div className={history.length > 0 ? "border-t border-border" : ""}>
              <div className="px-4 py-3 text-sm font-medium text-foreground flex items-center gap-2 bg-muted/30">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{t("hotSearch")}</span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {hotTerms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => selectFromHistory(term)}
                    className="text-xs px-3 py-1.5 bg-accent hover:bg-brand/10 hover:text-brand rounded-full text-foreground transition-colors font-medium"
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
