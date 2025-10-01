'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import CommunityStreakSelector from './CommunityStreakSelector'
import { getCurrentCommunityStreak, calculateCommunityParticipation } from '../../lib/communityStreakHelpers'

interface CommunityFeedProps {
  user: any
}

interface Community {
  id: string
  name: string
  ringsCompleted: number
  todayActive: number
  totalMembers: number
  ring_color?: string
  center_emoji?: string
}

interface CircleData {
  id: string
  name: string
  ring_color?: string
  center_emoji?: string
}

interface UserCircle {
  circle_id: string
  circles: CircleData
}

const MOOD_CONFIG = {
  1: { icon: '⛈️', label: 'Stormy', gradient: 'from-slate-300/40 to-slate-400/40', border: 'border-slate-400' },
  2: { icon: '🌧️', label: 'Rainy', gradient: 'from-blue-300/40 to-blue-400/40', border: 'border-blue-400' },
  3: { icon: '⛅', label: 'Cloudy', gradient: 'from-amber-200/40 to-amber-300/40', border: 'border-amber-400' },
  4: { icon: '☀️', label: 'Sunny', gradient: 'from-yellow-300/40 to-orange-300/40', border: 'border-yellow-400' }
}

export default function CommunityFeed({ user }: CommunityFeedProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserCommunities()
  }, [user?.id])

  useEffect(() => {
    if (selectedCommunityId) {
      fetchCommunityResponses(selectedCommunityId)
    }
  }, [selectedCommunityId])

  const fetchUserCommunities = async () => {
    if (!user?.id) return

    try {
      console.log('Fetching user communities for user:', user.id)
      
      const { data: userCircles, error: circlesError } = await supabase
        .from('circle_members')
        .select(`
          circle_id,
          circles!inner (
            id,
            name,
            ring_color,
            center_emoji
          )
        `)
        .eq('user_id', user.id) as { data: UserCircle[] | null, error: any }

      if (circlesError) throw circlesError

      if (!userCircles || userCircles.length === 0) {
        setCommunities([])
        setLoading(false)
        return
      }

      const communityData = await Promise.all(
        userCircles.map(async (uc: UserCircle) => {
          const circle = uc.circles
          
          if (!circle?.id || !circle?.name) {
            return null
          }
          
          const { count: totalMembers } = await supabase
            .from('circle_members')
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circle.id)

          const { data: streakData } = await getCurrentCommunityStreak(circle.id)
          const { activeMembers } = await calculateCommunityParticipation(circle.id)

          return {
            id: circle.id,
            name: circle.name,
            ringsCompleted: streakData?.rings_completed || 0,
            todayActive: activeMembers,
            totalMembers: totalMembers || 0,
            ring_color: circle.ring_color || 'periwinkle',
            center_emoji: circle.center_emoji || '🙏'
          }
        })
      )

      const validCommunityData = communityData.filter(Boolean) as Community[]
      setCommunities(validCommunityData)
      
      if (validCommunityData.length > 0 && !selectedCommunityId) {
        setSelectedCommunityId(validCommunityData[0].id)
      }
      
    } catch (error) {
      console.error('Error fetching user communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCircleMemberIds = async (circleId: string): Promise<string[]> => {
    const { data } = await supabase
      .from('circle_members')
      .select('user_id')
      .eq('circle_id', circleId)
    
    return data?.map(m => m.user_id) || []
  }

  const fetchCommunityResponses = async (communityId: string) => {
    if (!communityId) return

    try {
      console.log('Fetching responses for community:', communityId)
      
      const memberIds = await getCircleMemberIds(communityId)

      if (memberIds.length === 0) {
        setResponses([])
        return
      }

      const { data: sharedResponseIds, error: sharedError } = await supabase
        .from('response_circles')
        .select('response_id')
        .eq('circle_id', communityId)

      if (sharedError) throw sharedError

      const responseIds = sharedResponseIds?.map(sr => sr.response_id) || []

      if (responseIds.length === 0) {
        setResponses([])
        return
      }

      // Fetch responses with profiles AND wellbeing check-ins
      const { data: communityResponses, error: responsesError } = await supabase
        .from('gratitude_responses')
        .select(`
          *,
          gratitude_prompts (
            prompt,
            date
          ),
          profiles (
            display_name
          ),
          wellbeing_checkins (
            mood_score
          )
        `)
        .in('id', responseIds)
        .order('created_at', { ascending: false })
        .limit(10)

      if (responsesError) throw responsesError

      setResponses(communityResponses || [])
    } catch (error) {
      console.error('Error fetching community responses:', error)
    }
  }

  const getDisplayName = (response: any) => {
    if (response.profiles?.display_name) {
      return response.profiles.display_name
    }
    return `Community Member`
  }

  const getMoodData = (response: any) => {
    const moodScore = response.wellbeing_checkins?.[0]?.mood_score
    if (moodScore && moodScore >= 1 && moodScore <= 4) {
      return MOOD_CONFIG[moodScore as 1 | 2 | 3 | 4]
    }
    return null
  }

  const handleCommunitySelect = (communityId: string) => {
    setSelectedCommunityId(communityId)
  }

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-peach-200 rounded-lg mb-6 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-4 border-periwinkle-300 pl-4 mb-6 animate-pulse">
            <div className="h-4 bg-warm-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-warm-200 rounded w-3/4 mb-3"></div>
            <div className="h-16 bg-warm-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-periwinkle-400 to-periwinkle-500 flex items-center justify-center shadow-md">
            <span className="text-lg">🤝</span>
          </div>
          <h3 className="font-display text-2xl font-semibold text-sage-800">
            Community Feed
          </h3>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-periwinkle-100 to-warm-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💝</span>
          </div>
          <p className="font-brand text-sage-600 mb-2">No communities yet</p>
          <p className="font-brand text-sm text-sage-500 max-w-sm mx-auto">
            Join or create circles to see community gratitude here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-periwinkle-400 to-periwinkle-500 flex items-center justify-center shadow-md">
          <span className="text-lg">🤝</span>
        </div>
        <h3 className="font-display text-2xl font-semibold text-sage-800">
          Community Feed
        </h3>
      </div>

      <CommunityStreakSelector
        communities={communities}
        selectedCommunityId={selectedCommunityId}
        onCommunitySelect={handleCommunitySelect}
      />

      {selectedCommunity && (
        <div>
          {responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-brand text-sage-600 mb-2">
                No shared responses in {selectedCommunity.name} yet
              </p>
              <p className="font-brand text-sm text-sage-500">
                When members share gratitude with this circle, it will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {responses.map((response) => {
                const mood = getMoodData(response)
                
                return (
                  <div
                    key={response.id}
                    className={`
                      relative overflow-hidden border-l-4 ${mood ? mood.border : 'border-periwinkle-400'} 
                      pl-6 py-4 rounded-r-xl hover:shadow-md transition-all duration-200
                      bg-gradient-to-r ${mood ? mood.gradient : 'from-periwinkle-50 to-warm-50'}
                    `}
                  >
                    {/* Animated Weather Background */}
                    {mood && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {mood.label === 'Sunny' && (
                          <>
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-16 h-0.5 bg-yellow-300/30 animate-sunshine"
                                style={{
                                  top: '20%',
                                  right: '10%',
                                  transform: `rotate(${i * 60}deg)`,
                                  transformOrigin: 'left center',
                                  animationDelay: `${i * 0.2}s`
                                }}
                              />
                            ))}
                          </>
                        )}
                        {mood.label === 'Rainy' && (
                          <>
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-0.5 h-4 bg-blue-400/30 animate-rain"
                                style={{
                                  left: `${10 + i * 12}%`,
                                  animationDelay: `${i * 0.15}s`
                                }}
                              />
                            ))}
                          </>
                        )}
                        {mood.label === 'Stormy' && (
                          <>
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-0.5 h-6 bg-slate-400/40 animate-storm"
                                style={{
                                  left: `${15 + i * 15}%`,
                                  animationDelay: `${i * 0.2}s`
                                }}
                              />
                            ))}
                          </>
                        )}
                        {mood.label === 'Cloudy' && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl animate-pulse" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-periwinkle-300 to-periwinkle-400 flex items-center justify-center">
                            <span className="text-xs font-brand font-bold text-white">
                              {getDisplayName(response).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-brand font-medium text-sage-800">
                              {getDisplayName(response)}
                              {response.user_id === user.id && (
                                <span className="ml-2 text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                            {mood && (
                              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full">
                                <span className="text-lg">{mood.icon}</span>
                                <span className="text-xs font-brand font-medium text-sage-600">
                                  {mood.label}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-brand text-xs text-sage-500">
                            {new Date(response.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <h4 className="font-display text-lg font-medium text-sage-800 mb-3 leading-relaxed">
                        {response.gratitude_prompts?.prompt || 'Personal reflection'}
                      </h4>
                      
                      <p className="font-brand text-sage-700 leading-relaxed bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                        {response.response_text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes sunshine {
          0%, 100% { opacity: 0.2; transform: rotate(var(--rotation)) scale(1); }
          50% { opacity: 0.4; transform: rotate(var(--rotation)) scale(1.1); }
        }

        @keyframes rain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(400%); opacity: 0; }
        }

        @keyframes storm {
          0% { transform: translateY(-100%) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(400%) translateX(-20px); opacity: 0; }
        }

        .animate-sunshine {
          animation: sunshine 3s ease-in-out infinite;
        }

        .animate-rain {
          animation: rain 1.5s linear infinite;
        }

        .animate-storm {
          animation: storm 1.2s linear infinite;
        }
      `}</style>
    </div>
  )
}