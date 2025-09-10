'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import DailyPrompt from '../components/gratitude/DailyPrompt'
import GratitudeHistory from '../components/gratitude/GratitudeHistory'
import CommunityFeed from '../components/community/CommunityFeed'
import OnboardingFlow from '../components/onboarding/OnboardingFlow'
import WeeklyStreakRings from '../components/ui/WeeklyStreakRings'
import Navigation from '../components/ui/Navigation'
import { getCurrentWeekStreak } from '../lib/streakHelpers'
import { getTimeGreeting, getUserJourneyStage, getContextualMessage } from '../lib/heroHelpers'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [weeklyStreak, setWeeklyStreak] = useState({ rings_completed: 0 })
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

        // Fetch user's weekly streak
        if (profileData?.onboarding_completed) {
          const { data: streakData } = await getCurrentWeekStreak(session.user.id)
          if (streakData) {
            setWeeklyStreak(streakData)
          }
        }

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

  const handleNewResponse = async () => {
    setRefreshTrigger(prev => prev + 1)
    
    // Refresh streak data after new response
    if (user?.id) {
      const { data: streakData } = await getCurrentWeekStreak(user.id)
      if (streakData) {
        setWeeklyStreak(streakData)
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-morning-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-periwinkle-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-brand">Loading your gratitude space...</p>
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

  const userName = profile?.display_name || user.email?.split('@')[0] || 'there'
  const journeyStage = getUserJourneyStage(profile)
  const timeGreeting = getTimeGreeting()
  const contextualMessage = getContextualMessage(journeyStage, weeklyStreak.rings_completed)

  return (
    <div className="min-h-screen bg-morning-gradient">
      {/* Mobile-Optimized Navigation */}
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Smart Contextual Header - Mobile Optimized */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col items-center space-y-6 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8">
            <div className="text-center sm:text-left">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-sage-800 mb-3 leading-tight">
                {timeGreeting}, {userName}
              </h1>
              <p className="font-brand text-base sm:text-lg text-sage-600 max-w-sm mx-auto sm:mx-0 sm:max-w-md leading-relaxed px-4 sm:px-0">
                {contextualMessage}
              </p>
            </div>
            
            {/* Weekly Streak - Mobile Optimized */}
            <div className="flex-shrink-0">
              <WeeklyStreakRings 
                ringsCompleted={weeklyStreak.rings_completed} 
                size={80}
              />
            </div>
          </div>
        </header>

        <div className="space-y-8 sm:space-y-12">
          <DailyPrompt user={user} onNewResponse={handleNewResponse} />
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
            <GratitudeHistory user={user} refreshTrigger={refreshTrigger} />
            <CommunityFeed user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}