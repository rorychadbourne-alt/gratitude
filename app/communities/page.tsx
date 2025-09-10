'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import CreateCircle from '../../components/community/CreateCircle'
import JoinCircle from '../../components/community/JoinCircle'
import CircleCustomization from '../../components/community/CircleCustomization'
import Navigation from '../../components/ui/Navigation'

export default function Communities() {
  const [user, setUser] = useState<any>(null)
  const [circles, setCircles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [customizingCircle, setCustomizingCircle] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      fetchUserCircles(session.user.id)
    }
    getUser()
  }, [])

  const fetchUserCircles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          role,
          circles (
            id,
            name,
            description,
            created_by,
            ring_color,
            center_emoji,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (error) throw error
      
      const circleData = data?.map(item => ({
        ...item.circles,
        role: item.role
      })) || []
      
      setCircles(circleData)
    } catch (error) {
      console.error('Error fetching circles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCircleCreated = () => {
    setShowCreateModal(false)
    if (user?.id) {
      fetchUserCircles(user.id)
    }
  }

  const handleCircleJoined = () => {
    setShowJoinModal(false)
    if (user?.id) {
      fetchUserCircles(user.id)
    }
  }

  const handleCustomizeCircle = (circle: any) => {
    setCustomizingCircle(circle)
  }

  const handleCustomizationUpdate = (updatedCircle: any) => {
    setCircles(circles.map(circle => 
      circle.id === updatedCircle.id ? { ...circle, ...updatedCircle } : circle
    ))
    setCustomizingCircle(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-morning-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-periwinkle-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-brand">Loading your circles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-morning-gradient">
      {/* Mobile-Optimized Navigation */}
      <Navigation currentPage="communities" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-sage-800 mb-2">
              My Circles
            </h1>
            <p className="text-gray-600 font-brand text-sm sm:text-base">
              Create and manage your gratitude communities
            </p>
          </div>
          
          {/* Action Buttons - Mobile Stack */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full sm:w-auto bg-white text-periwinkle-600 border border-periwinkle-200 py-3 px-4 rounded-lg hover:bg-periwinkle-50 font-brand font-medium transition-colors text-center min-h-[48px]"
            >
              Join Circle
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-3 px-4 rounded-lg hover:from-periwinkle-600 hover:to-periwinkle-700 font-brand font-medium transition-all shadow-md min-h-[48px]"
            >
              Create Circle
            </button>
          </div>
        </div>

        {/* Circles Grid - Mobile Optimized */}
        {circles.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-periwinkle-100 to-warm-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-display text-xl font-medium text-sage-800 mb-2">
              No circles yet
            </h3>
            <p className="text-gray-600 font-brand mb-6 max-w-sm mx-auto px-4 sm:px-0 text-sm sm:text-base">
              Create your first gratitude circle or join an existing one to start sharing with others.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-3 max-w-sm mx-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-white text-periwinkle-600 border border-periwinkle-200 py-3 px-4 rounded-lg hover:bg-periwinkle-50 font-brand font-medium transition-colors min-h-[48px]"
              >
                Join Circle
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-3 px-4 rounded-lg hover:from-periwinkle-600 hover:to-periwinkle-700 font-brand font-medium transition-all min-h-[48px]"
              >
                Create Circle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {circles.map((circle) => (
              <div
                key={circle.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ 
                        backgroundColor: circle.ring_color === 'gold' ? '#fefdfb' : 
                                          circle.ring_color === 'sage' ? '#f8f9f6' :
                                          circle.ring_color === 'peach' ? '#fef8f4' : '#f4f3ff'
                      }}
                    >
                      {circle.center_emoji || '🤝'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base sm:text-lg font-semibold text-sage-800 truncate">
                        {circle.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-brand font-medium ${
                          circle.role === 'creator' 
                            ? 'bg-gold-100 text-gold-800' 
                            : 'bg-periwinkle-100 text-periwinkle-800'
                        }`}>
                          {circle.role === 'creator' ? 'Creator' : 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {circle.created_by === user?.id && (
                    <button
                      onClick={() => handleCustomizeCircle(circle)}
                      className="text-gray-400 hover:text-periwinkle-600 transition-colors p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Customize circle"
                    >
                      <span className="text-lg">⚙️</span>
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 font-brand text-sm mb-4 line-clamp-2">
                  {circle.description || 'A gratitude sharing circle'}
                </p>
                
                <div className="text-xs text-gray-500 font-brand">
                  Created {new Date(circle.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCircle
          user={user}
          onClose={() => setShowCreateModal(false)}
          onCircleCreated={handleCircleCreated}
        />
      )}

      {showJoinModal && (
        <JoinCircle
          user={user}
          onClose={() => setShowJoinModal(false)}
          onCircleJoined={handleCircleJoined}
        />
      )}

      {customizingCircle && (
        <CircleCustomization
          circle={customizingCircle}
          user={user}
          onClose={() => setCustomizingCircle(null)}
          onUpdate={handleCustomizationUpdate}
        />
      )}
    </div>
  )
}