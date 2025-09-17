'use client'

import { useEffect, useState } from 'react'

export interface ToastData {
  id: string
  type: 'success' | 'celebration' | 'milestone'
  title: string
  message?: string
  duration?: number
  icon?: string
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void
}

export default function Toast({ id, type, title, message, icon, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true))

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onClose(id), 400) // Match animation duration
    }, duration)

    return () => clearTimeout(dismissTimer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(id), 400)
  }

  const getToastStyles = () => {
    switch (type) {
      case 'celebration':
        return {
          container: 'bg-gradient-to-r from-gold-400 to-peach-400 border-gold-300 shadow-2xl',
          text: 'text-white',
          glow: 'shadow-gold-400/50'
        }
      case 'milestone':
        return {
          container: 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300 shadow-2xl animate-pulse',
          text: 'text-white',
          glow: 'shadow-purple-400/50'
        }
      default:
        return {
          container: 'bg-white border-green-200 shadow-lg',
          text: 'text-gray-800',
          glow: 'shadow-green-100/50'
        }
    }
  }

  const styles = getToastStyles()
  const isCelebratory = type === 'celebration' || type === 'milestone'

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 max-w-sm w-full transform transition-all duration-400 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100 scale-100' 
          : isLeaving 
            ? 'translate-y-[-100%] opacity-0 scale-95'
            : 'translate-y-[-50px] opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        rounded-2xl border-2 p-4 backdrop-blur-sm relative overflow-hidden
        ${styles.container} ${styles.glow}
        ${isCelebratory ? 'animate-bounce-gentle' : ''}
      `}>
        {/* Celebratory background effects */}
        {isCelebratory && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-300 rounded-full animate-ping delay-300"></div>
          </>
        )}

        <div className="flex items-start space-x-3 relative z-10">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl
            ${isCelebratory ? 'bg-white/20' : 'bg-green-100'}
          `}>
            {icon || (isCelebratory ? '🎉' : '✅')}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`
              font-brand font-semibold text-sm leading-tight
              ${styles.text}
              ${isCelebratory ? 'text-shadow' : ''}
            `}>
              {title}
            </h4>
            {message && (
              <p className={`
                font-brand text-xs mt-1 leading-snug opacity-90
                ${styles.text}
              `}>
                {message}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded-full transition-colors
              ${isCelebratory 
                ? 'text-white/80 hover:text-white hover:bg-white/20' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }
            `}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar for non-celebratory toasts */}
        {!isCelebratory && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-200">
            <div 
              className="h-full bg-green-500 transition-all ease-linear"
              style={{ 
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}