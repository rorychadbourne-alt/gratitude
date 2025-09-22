'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-orange-100 sticky top-0 z-40 relative overflow-hidden">
        {/* Subtle background orbital elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-2 right-20 w-8 h-8">
            <div className="absolute w-2 h-2 bg-orange-400 rounded-full top-3 left-3"></div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '30s' }}>
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-orange-300 rounded-full transform -translate-x-1/2"></div>
              <div className="absolute bottom-0 right-0 w-0.5 h-0.5 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Gratitude Circle Logo"
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-200"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900 hidden sm:block leading-none">
                  Gratitude Circle
                </h1>
                <h1 className="text-lg font-display font-bold text-gray-900 sm:hidden leading-none">
                  Gratitude
                </h1>
                <div className="hidden sm:block text-xs font-brand text-gray-500 -mt-0.5">
                  Community gratitude sharing
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              {currentPage !== 'dashboard' && (
                <button
                  onClick={() => router.push('/')}
                  className="relative group text-gray-600 hover:text-orange-600 text-sm font-medium font-brand px-4 py-2 rounded-full transition-all duration-200 hover:bg-orange-50"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}
              
              {currentPage !== 'communities' && (
                <button
                  onClick={() => router.push('/communities')}
                  className="relative group text-gray-600 hover:text-orange-600 text-sm font-medium font-brand px-4 py-2 rounded-full transition-all duration-200 hover:bg-orange-50"
                >
                  <span className="relative z-10">Communities</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}
              
              {currentPage !== 'profile' && (
                <button
                  onClick={() => router.push('/profile')}
                  className="relative group text-gray-600 hover:text-orange-600 text-sm font-medium font-brand px-4 py-2 rounded-full transition-all duration-200 hover:bg-orange-50"
                >
                  <span className="relative z-10">Profile</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}

              <div className="ml-2 pl-2 border-l border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-sm font-medium font-brand py-2 px-4 rounded-full hover:from-orange-200 hover:to-yellow-200 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 relative"
              aria-label="Open menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className="block w-6 h-0.5 bg-current rounded-full transition-all duration-200"></span>
                <span className="block w-6 h-0.5 bg-current rounded-full transition-all duration-200"></span>
                <span className="block w-6 h-0.5 bg-current rounded-full transition-all duration-200"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeMobileMenu}
          ></div>
          
          {/* Slide-out Menu with background motifs */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-2xl transform transition-transform relative overflow-hidden">
            {/* Subtle background patterns */}
            <div className="absolute inset-0 opacity-8 pointer-events-none">
              <div className="absolute top-8 right-8 w-16 h-16">
                <div className="absolute w-3 h-3 bg-orange-300 rounded-full top-6.5 left-6.5"></div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '25s' }}>
                  <div className="absolute top-1 left-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full transform -translate-x-1/2"></div>
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
                  <div className="absolute left-1 top-1/2 w-1 h-1 bg-yellow-500 rounded-full transform -translate-y-1/2"></div>
                </div>
              </div>
              
              <div className="absolute bottom-16 left-8 w-12 h-12">
                <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-5 left-5"></div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-orange-300 rounded-full transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-100 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 relative">
                  <Image
                    src="/logo.png"
                    alt="Gratitude Circle Logo"
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900 leading-none">
                    Gratitude Circle
                  </h2>
                  <div className="text-xs font-brand text-gray-500 -mt-0.5">
                    Community gratitude
                  </div>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-6 relative z-10">
              <div className="space-y-3">
                <button
                  onClick={() => handleNavigation('/')}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-brand font-medium transition-all duration-200 ${
                    currentPage === 'dashboard'
                      ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
                    <span>Dashboard</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleNavigation('/communities')}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-brand font-medium transition-all duration-200 ${
                    currentPage === 'communities'
                      ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
                    <span>Communities</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleNavigation('/profile')}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-brand font-medium transition-all duration-200 ${
                    currentPage === 'profile'
                      ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
                    <span>Profile</span>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-orange-100"></div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleSignOut()
                }}
                className="w-full text-left px-4 py-3 rounded-2xl font-brand font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full opacity-60"></div>
                  <span>Sign Out</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}