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
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-periwinkle-500 mx-auto"></div>
        
          <p className="mt-4 text-gray-600">Loading your gratitude space...</p>
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
    <div className="min-h-screen bg-warm-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Gratitude Circle
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/communities')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Communities
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Profile
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good day, {user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-600">
            Take a moment to reflect and share your gratitude.
          </p>
        </header>

        <div className="space-y-8">
          <DailyPrompt user={user} onNewResponse={handleNewResponse} />
          <div className="grid gap-8 lg:grid-cols-2">
            <GratitudeHistory user={user} refreshTrigger={refreshTrigger} />
            <CommunityFeed user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}