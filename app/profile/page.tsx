'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import UserProfile from '../../components/profile/UserProfile'
import Navigation from '../../components/ui/Navigation'
import WellbeingGraph from '../../components/profile/WellbeingGraph'
import MoodLineChart from '../../components/profile/MoodLineChart'
import MoodInsights from '../../components/profile/MoodInsights'

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
      <Navigation currentPage="profile" />

      <div className="px-4 py-6 sm:py-8 max-w-4xl mx-auto space-y-6">
        <UserProfile user={user} profile={profile} />
        
        {/* Mood Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodLineChart userId={user.id} />
          <MoodInsights userId={user.id} />
        </div>
        
        {/* Original Bar Chart */}
        <WellbeingGraph userId={user.id} />
      </div>
    </div>
  )
}