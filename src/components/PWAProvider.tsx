'use client'

import { useEffect } from 'react'
import { usePWA, useOnlineStatus } from '@/hooks/usePWA'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus()
  const { isLoading: _isLoading } = usePWA()

  useEffect(() => {
    if (!isOnline) {
      document.body.classList.add('offline')
    } else {
      document.body.classList.remove('offline')
    }
  }, [isOnline])

  return (
    <>
      {children}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 bg-yellow-100 border border-yellow-400 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">You are offline</span>
          </div>
          <p className="mt-1 text-sm text-yellow-700">Some features may be limited.</p>
        </div>
      )}
    </>
  )
}