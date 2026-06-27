/**
 * ============================================
 * Payment Polling Hook
 * ============================================
 * 创建时间：2026-06-28 01:10:00 +08:00
 * 创建依据：v1.7规范 - 支付状态轮询
 * 功能说明：
 *   - 指数退避轮询
 *   - 超时处理
 *   - 自动停止
 * ============================================
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface UsePaymentPollingOptions {
  orderId: string
  enabled: boolean
  onSuccess: () => void
  onError: (error: Error) => void
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  timeout?: number
}

interface PaymentStatus {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
  orderId: string
}

export function usePaymentPolling({
  orderId,
  enabled,
  onSuccess,
  onError,
  maxAttempts = 60, // 最多60次
  initialDelay = 2000, // 2秒
  maxDelay = 10000, // 最大10秒
  timeout = 300000 // 5分钟超时
}: UsePaymentPollingOptions) {
  const [attempts, setAttempts] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !orderId) {
      return
    }

    setIsPolling(true)
    startTimeRef.current = Date.now()
    let currentAttempt = 0

    const poll = async () => {
      try {
        // 检查超时
        if (Date.now() - (startTimeRef.current || 0) > timeout) {
          throw new Error('Payment polling timeout')
        }

        // 检查最大尝试次数
        if (currentAttempt >= maxAttempts) {
          throw new Error('Maximum polling attempts reached')
        }

        currentAttempt++
        setAttempts(currentAttempt)

        // 调用API检查支付状态
        const response = await fetch(`/api/orders/${orderId}/status`)
        if (!response.ok) {
          throw new Error('Failed to fetch payment status')
        }

        const data: PaymentStatus = await response.json()

        if (data.status === 'PAID') {
          setIsPolling(false)
          onSuccess()
          return
        }

        if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setIsPolling(false)
          onError(new Error(`Payment ${data.status.toLowerCase()}`))
          return
        }

        // 指数退避：2s -> 4s -> 8s -> 10s (max)
        const delay = Math.min(
          initialDelay * Math.pow(2, currentAttempt - 1),
          maxDelay
        )

        timeoutRef.current = setTimeout(poll, delay)
      } catch (error) {
        setIsPolling(false)
        onError(error as Error)
      }
    }

    poll()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsPolling(false)
    }
  }, [orderId, enabled, maxAttempts, initialDelay, maxDelay, timeout, onSuccess, onError])

  return {
    isPolling,
    attempts
  }
}
