'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface NavigationProps {
  currentPage?: 'dashboard' | 'communities' | 'profile'
}

export default function Navigation({ currentPage = 'dashboard' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false)
    router.push(path)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-periwinkle-500 to-periwinkle-600 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <h1 className="text-xl font-brand font-bold text-gray-900 hidden sm:block">
                Gratitude Circle
              </h1>
              <h1 className="text-lg font-brand font-bold text-gray-900 sm:hidden">
                Gratitude
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-6">
              {currentPage !== 'dashboard' && (
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors"
                >
                  Dashboard
                </button>
              )}
              
              {currentPage !== 'communities' && (
                <button
                  onClick={() => router.push('/communities')}
                  className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors"
                >
                  Communities
                </button>
              )}
              
              {currentPage !== 'profile' && (
                <button
                  onClick={() => router.push('/profile')}
                  className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors"
                >
                  Profile
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="bg-periwinkle-100 text-periwinkle-700 text-sm font-medium font-brand py-2 px-4 rounded-lg hover:bg-periwinkle-200 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-md text-gray-600 hover:text-periwinkle-600 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={closeMobileMenu}
          ></div>
          
          {/* Slide-out Menu */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-periwinkle-500 to-periwinkle-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <h2 className="text-lg font-brand font-bold text-gray-900">
                  Gratitude Circle
                </h2>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('/')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-brand font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-periwinkle-100 text-periwinkle-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                
                <button
                  onClick={() => handleNavigation('/communities')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-brand font-medium transition-colors ${
                    currentPage === 'communities'
                      ? 'bg-periwinkle-100 text-periwinkle-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Communities
                </button>
                
                <button
                  onClick={() => handleNavigation('/profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-brand font-medium transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-periwinkle-100 text-periwinkle-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </button>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200"></div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleSignOut()
                }}
                className="w-full text-left px-4 py-3 rounded-lg font-brand font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}