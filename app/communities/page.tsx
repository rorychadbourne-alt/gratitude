'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import CreateCircle from '../../components/community/CreateCircle'
import JoinCircle from '../../components/community/JoinCircle'

export default function Communities() {
  const [user, setUser] = useState<any>(null)
  const [circles, setCircles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getUser()
    fetchUserCircles()
  }, [])

  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUser(session.user)
  }

  const fetchUserCircles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          circles (
            id,
            name,
            invite_code,
            created_by,
            created_at
          )
        `)
        .eq('user_id', session.user.id)

      if (error) throw error
      const userCircles = data?.map(item => item.circles).filter(Boolean) || []
      setCircles(userCircles)
    } catch (error) {
      console.error('Error fetching circles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-morning-gradient">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-periwinkle-500 to-periwinkle-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <h1 className="text-xl font-brand font-bold text-gray-900">
                Gratitude Circle
              </h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-periwinkle-600 text-sm font-medium font-brand px-3 py-2 rounded-md transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl font-semibold text-sage-800 mb-4">
            Your Communities
          </h1>
          <p className="font-brand text-sage-600 max-w-2xl mx-auto">
            Create and join gratitude circles to share your journey with others
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          <CreateCircle user={user} onCircleCreated={fetchUserCircles} />
          <JoinCircle user={user} onCircleJoined={fetchUserCircles} />
        </div>

        {/* User's Circles */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <h2 className="font-display text-2xl font-semibold text-sage-800 mb-6">
            Your Circles
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-warm-100 rounded-lg p-4 h-24"></div>
              ))}
            </div>
          ) : circles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-200 to-gold-200 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <p className="font-brand text-sage-600 mb-2">No circles yet</p>
              <p className="font-brand text-sm text-sage-500">
                Create your first circle or join one using an invite code
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {circles.map((circle) => (
                <div
                  key={circle.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-brand font-semibold text-sage-800 text-lg mb-2">
                        {circle.name}
                      </h3>
                      <p className="font-brand text-sm text-sage-500">
                        Created {new Date(circle.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-brand text-xs text-sage-500 mb-1">Invite Code</p>
                      <code className="bg-periwinkle-100 text-periwinkle-800 px-3 py-1 rounded-lg font-brand text-sm font-medium">
                        {circle.invite_code}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}