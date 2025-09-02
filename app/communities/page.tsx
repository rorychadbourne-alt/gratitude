'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import CreateCircle from '../../components/community/CreateCircle'
import JoinCircle from '../../components/community/JoinCircle'
import MyCircles from '../../components/community/MyCircles'

export default function CommunitiesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  useEffect(() => {
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
  }, [router])

  const handleCircleCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communities...</p>
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
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Dashboard
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Communities
          </h1>
          <p className="text-gray-600">
            Create and join gratitude circles to share your journey with others.
          </p>
        </header>

        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <CreateCircle user={user} onCircleCreated={handleCircleCreated} />
            <JoinCircle user={user} onCircleJoined={handleCircleCreated} />
          </div>
          <MyCircles user={user} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}