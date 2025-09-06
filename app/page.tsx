'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import DailyPrompt from '../components/gratitude/DailyPrompt'
import GratitudeHistory from '../components/gratitude/GratitudeHistory'
import CommunityFeed from '../components/community/CommunityFeed'
import OnboardingFlow from '../components/onboarding/OnboardingFlow'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
        setLoading(false)
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      setUser(session?.user || null)
      if (!session && mounted) {
        router.push('/login')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleNewResponse = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleOnboardingComplete = () => {
    const refreshProfile = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
    refreshProfile()
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen organic-background" style={{
        background: 'linear-gradient(135deg, #fdf9f0 0%, #fef8f4 50%, #fefdf8 100%)'
      }}>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-periwinkle-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-brand">Loading your gratitude space...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (profile && !profile.onboarding_completed) {
    return <OnboardingFlow user={user} onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen organic-background" style={{
      background: 'linear-gradient(135deg, #fdf9f0 0%, #fef8f4 50%, #fefdf8 100%)'
    }}>
      {/* Content overlay */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-periwinkle-500 to-periwinkle-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <h1 className="text-xl font-brand font-bold text-gray-900">
                  Gratitude Circle
                </h1>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => router.push('/communities')}
                  className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors"
                >
                  Communities
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-periwinkle-100 text-periwinkle-700 text-sm font-medium font-brand py-2 px-4 rounded-lg hover:bg-periwinkle-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <header className="mb-12 text-center">
            <h1 className="font-display text-5xl font-semibold text-sage-800 mb-4 leading-tight">
              Good morning, {user.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600 font-brand text-lg max-w-2xl mx-auto leading-relaxed">
              Take a moment to reflect and share your gratitude. Today is a new opportunity to notice the beauty around you.
            </p>
          </header>

          <div className="space-y-12">
            <DailyPrompt user={user} onNewResponse={handleNewResponse} />
            <div className="grid gap-12 lg:grid-cols-2">
              <GratitudeHistory user={user} refreshTrigger={refreshTrigger} />
              <CommunityFeed user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}