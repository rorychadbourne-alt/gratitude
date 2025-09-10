'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import UserProfile from '../../components/profile/UserProfile'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      } catch (error) {
        console.log('Profile not found')
        setProfile(null)
      }
      
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-morning-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-periwinkle-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-brand">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-morning-gradient">
      {/* Navigation - Mobile Optimized */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-periwinkle-500 to-periwinkle-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xs sm:text-sm font-bold">G</span>
              </div>
              <h1 className="text-lg sm:text-xl font-brand font-bold text-gray-900">
                Gratitude Circle
              </h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-periwinkle-600 text-xs sm:text-sm font-medium font-brand px-2 sm:px-3 py-2 rounded-md transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 sm:py-8">
        <UserProfile user={user} profile={profile} />
      </div>
    </div>
  )
}