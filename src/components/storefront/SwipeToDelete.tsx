"use client"

import { useRef, useState, useCallback } from "react"

interface SwipeToDeleteProps {
  children: React.ReactNode
  onDelete: () => void
  deleteWidth?: number
  threshold?: number
}

export function SwipeToDelete({
  children,
  onDelete,
  deleteWidth = 56,
  threshold = 0.5,
}: SwipeToDeleteProps) {
  const [offsetX, setOffsetX] = useState(0)
  const startXRef = useRef(0)
  const currentOffsetRef = useRef(0)

  const isOpen = offsetX !== 0

  const close = useCallback(() => {
    setOffsetX(0)
    currentOffsetRef.current = 0
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.touches[0].clientX - startXRef.current
      const newOffset = Math.max(-deleteWidth, Math.min(0, currentOffsetRef.current + deltaX))
      setOffsetX(newOffset)
    },
    [deleteWidth]
  )

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(offsetX) > deleteWidth * threshold) {
      setOffsetX(-deleteWidth)
      currentOffsetRef.current = -deleteWidth
    } else {
      setOffsetX(0)
      currentOffsetRef.current = 0
    }
  }, [offsetX, deleteWidth, threshold])

  const handleDelete = useCallback(() => {
    close()
    onDelete()
  }, [close, onDelete])

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center bg-destructive text-destructive-foreground font-medium text-xs"
        style={{ width: deleteWidth }}
      >
        <button
          onClick={handleDelete}
          onTouchEnd={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          className="w-full h-full flex items-center justify-center"
          aria-label="删除"
        >
          删除
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute inset-0 z-20"
          onClick={close}
          onTouchStart={close}
        />
      )}

      <div
        className={`relative transition-transform ${isOpen ? "pointer-events-none" : ""}`}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 || offsetX === -deleteWidth ? "transform 0.2s ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
