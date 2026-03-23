"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // 从 localStorage 读取搜索历史
  useEffect(() => {
    try {
      const saved = localStorage.getItem("solo_search_history")
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load search history", e)
    }
  }, [])

  // 保存搜索历史到 localStorage
  const saveHistory = (newHistory: string[]) => {
    try {
      localStorage.setItem("solo_search_history", JSON.stringify(newHistory))
      setHistory(newHistory)
    } catch (e) {
      console.error("Failed to save search history", e)
    }
  }

  const handleSearch = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    // 更新搜索历史（最多保留 8 条，去重）
    const newHistory = [trimmedQuery, ...history.filter(h => h !== trimmedQuery)].slice(0, 8)
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
          placeholder="搜索商品..."
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
              <span>搜索历史</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={clearHistory}
            >
              清空
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
          搜索
        </Button>
      </div>
    </div>
  )
}