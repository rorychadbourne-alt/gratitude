'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import Toast, { ToastData } from './Toast'

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  showSuccess: (title: string, message?: string) => void
  showCelebration: (title: string, message?: string, icon?: string) => void
  showMilestone: (title: string, message?: string, icon?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newToast: ToastData = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 4000
    })
  }, [showToast])

  const showCelebration = useCallback((title: string, message?: string, icon?: string) => {
    showToast({
      type: 'celebration',
      title,
      message,
      icon,
      duration: 6000 // Longer for celebrations
    })
  }, [showToast])

  const showMilestone = useCallback((title: string, message?: string, icon?: string) => {
    showToast({
      type: 'milestone',
      title,
      message,
      icon,
      duration: 8000 // Longest for milestones
    })
  }, [showToast])

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showCelebration,
      showMilestone
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-3 max-h-screen overflow-hidden">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}