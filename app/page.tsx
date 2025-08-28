'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import DailyPrompt from '../components/gratitude/DailyPrompt'
import GratitudeHistory from '../components/gratitude/GratitudeHistory'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleNewResponse = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your gratitude space...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Gratitude Circle
            </h1>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good day, {user.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-600">
            Take a moment to reflect and share your gratitude.
          </p>
        </header>

        <div className="space-y-8">
          <DailyPrompt user={user} onNewResponse={handleNewResponse} />
          <GratitudeHistory user={user} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}