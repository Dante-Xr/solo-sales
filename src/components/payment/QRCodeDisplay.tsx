/**
 * ============================================
 * QR Code Display Component
 * ============================================
 * 创建时间：2026-06-28 01:05:00 +08:00
 * 创建依据：v1.7规范 - 二维码展示
 * 功能说明：
 *   - 使用qrcode.react渲染QR码
 *   - 倒计时功能
 *   - 过期刷新
 * ============================================
 */

'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Clock } from 'lucide-react'

interface QRCodeDisplayProps {
  data: string
  expiry: Date
  onRefresh: () => void
  isRefreshing?: boolean
  title?: string
  description?: string
}

export function QRCodeDisplay({
  data,
  expiry,
  onRefresh,
  isRefreshing = false,
  title = 'Scan QR Code to Pay',
  description = 'Use your mobile payment app to scan'
}: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const expiryTime = new Date(expiry).getTime()
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000))

      setTimeLeft(remaining)
      setIsExpired(remaining === 0)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiry])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4">
        {isExpired ? (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>
              QR code has expired. Please refresh to generate a new one.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={data}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Expires in <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh QR Code'}
        </Button>
      </CardFooter>
    </Card>
  )
}
