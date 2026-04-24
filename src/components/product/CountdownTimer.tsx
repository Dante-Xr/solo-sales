"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"

interface CountdownTimerProps {
  targetDate: Date | string
  label?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const t = useTranslations("urgency")
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate
    setTimeLeft(calculateTimeLeft(target))

    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target))
    }, 1000)

    return () => clearInterval(id)
  }, [targetDate])

  if (!mounted) return null

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
        <span className="text-sm font-bold text-destructive">{t("ended")}</span>
      </div>
    )
  }

  const blocks: { value: string; unit: string }[] = [
    { value: pad(timeLeft.days), unit: t("days") },
    { value: pad(timeLeft.hours), unit: t("hours") },
    { value: pad(timeLeft.minutes), unit: t("minutes") },
    { value: pad(timeLeft.seconds), unit: t("seconds") },
  ]

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-1">
        {blocks.map((block, i) => (
          <div key={block.unit} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-foreground text-background text-base font-bold tabular-nums">
                {block.value}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{block.unit}</span>
            </div>
            {i < blocks.length - 1 && (
              <span className="text-foreground font-bold text-base mb-3">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
