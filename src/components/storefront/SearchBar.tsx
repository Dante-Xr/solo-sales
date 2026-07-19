/**
 * ============================================
 * 搜索栏组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新为使用 next-intl 国际化
 * 功能说明：
 *   - 搜索框输入和提交
 *   - 搜索历史记录
 *   - 支持从历史记录选择
 *   - 使用 next-intl 进行国际化
 * ============================================
 */

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, History } from "lucide-react"
import { useTranslations } from "next-intl"

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const t = useTranslations()
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("solo_search_history")
        if (saved) {
          return JSON.parse(saved) as string[]
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return [] as string[]
  })
  const [showHistory, setShowHistory] = useState(false)

  const saveHistory = (newHistory: string[]) => {
    try {
      localStorage.setItem("solo_search_history", JSON.stringify(newHistory))
      setHistory(newHistory)
    } catch {
      // Ignore localStorage errors
    }
  }

  const handleSearch = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    // 更新搜索历史（最多保留 5 条，去重）
    const newHistory = [trimmedQuery, ...history.filter(h => h !== trimmedQuery)].slice(0, 5)
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

  const removeFromHistory = (item: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newHistory = history.filter(h => h !== item)
    saveHistory(newHistory)
  }

  return (
    <div className="relative w-full">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder={t('nav.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setQuery("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 搜索历史下拉框 */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History className="w-4 h-4" />
              <span>{t('nav.searchHistory')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={clearHistory}
            >
              {t('common.clear')}
            </Button>
          </div>
          
          <div className="py-1">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                onClick={() => selectFromHistory(item)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <History className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate">{item}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => removeFromHistory(item, e)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜索按钮 */}
      <div className="mt-2">
        <Button
          onClick={handleSearch}
          className="w-full"
          disabled={!query.trim()}
        >
          <Search className="w-4 h-4 mr-2" />
          {t('common.search')}
        </Button>
      </div>
    </div>
  )
}
