'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface RealTimeClockProps {
  className?: string
  showIcon?: boolean
  showDate?: boolean
  format?: '12h' | '24h'
}

export function RealTimeClock({
  className = '',
  showIcon = true,
  showDate = false,
  format = '24h'
}: RealTimeClockProps) {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial time on client side
    setTime(new Date())

    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!time) {
    return null // Don't render on server
  }

  const formatTime = (date: Date) => {
    if (format === '12h') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className={`flex items-center gap-2 font-mono text-sm ${className}`}>
      {showIcon && <Clock className="w-4 h-4" />}
      <div className="flex flex-col items-end">
        <span className="font-medium">{formatTime(time)}</span>
        {showDate && (
          <span className="text-xs text-cream-muted">{formatDate(time)}</span>
        )}
      </div>
    </div>
  )
}
