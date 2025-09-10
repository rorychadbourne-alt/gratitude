'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface NavigationProps {
  currentPage?: 'dashboard' | 'communities' | 'profile'
}

export default function Navigation({ currentPage = 'dashboard' }: NavigationProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
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

          {/* Navigation Links - Mobile Optimized */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {currentPage !== 'dashboard' && (
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors min-h-[44px] flex items-center"
              >
                <span className="sm:hidden">🖊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            
            {currentPage !== 'communities' && (
              <button
                onClick={() => router.push('/communities')}
                className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors min-h-[44px] flex items-center"
              >
                <span className="sm:hidden">👥</span>
                <span className="hidden sm:inline">Communities</span>
              </button>
            )}
            
            {currentPage !== 'profile' && (
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors min-h-[44px] flex items-center"
              >
                <span className="sm:hidden">👤</span>
                <span className="hidden sm:inline">Profile</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="bg-periwinkle-100 text-periwinkle-700 text-sm font-medium font-brand py-2 px-3 sm:px-4 rounded-lg hover:bg-periwinkle-200 transition-colors min-h-[44px] flex items-center"
            >
              <span className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}