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
      <div className="min-h-screen bg-morning-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-periwinkle-400 to-periwinkle-500 animate-pulse mx-auto mb-6"></div>
          <p className="font-body text-sage-600">Loading your gratitude space...</p>
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
    <div className="min-h-screen bg-morning-gradient">
      {/* Navigation */}
      <nav className="bg-morning-gradient backdrop-blur-sm border-b border-cream-200 shadow-soft sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-brand bg-gradient-to-br from-periwinkle-400 to-periwinkle-500 flex items-center justify-center">
                <span className="text-white text-lg font-brand font-semibold">G</span>
              </div>
              <h1 className="font-brand font-semibold text-2xl text-sage-800">
                Gratitude Circle
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/communities')}
                className="font-brand text-sage-600 hover:text-periwinkle-600 px-3 py-2 rounded-brand transition-colors duration-200"
              >
                Communities
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="font-brand text-sage-600 hover:text-periwinkle-600 px-3 py-2 rounded-brand transition-colors duration-200"
              >
                Profile
              </button>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-gold-100 to-peach-100 text-periwinkle-700 font-brand font-medium text-sm py-2 px-4 rounded-brand-lg shadow-soft hover:shadow-gentle hover:scale-105 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="font-brand font-semibold text-5xl text-sage-800 mb-4">
            Good morning, {user.email?.split('@')[0]} ✨
          </h1>
          <p className="font-body text-lg text-sage-600 max-w-2xl mx-auto leading-relaxed">
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
  )
}