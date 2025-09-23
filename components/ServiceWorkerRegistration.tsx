'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration)
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
  }, [])

  // This component doesn't render anything
  return null
}