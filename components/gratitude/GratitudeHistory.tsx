'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface GratitudeHistoryProps {
  user: any
  refreshTrigger: number
}

const MOOD_CONFIG = {
  1: { icon: '⛈️', label: 'Stormy', gradient: 'from-slate-300/40 to-slate-400/40', border: 'border-slate-400' },
  2: { icon: '🌧️', label: 'Rainy', gradient: 'from-blue-300/40 to-blue-400/40', border: 'border-blue-400' },
  3: { icon: '⛅', label: 'Cloudy', gradient: 'from-amber-200/40 to-amber-300/40', border: 'border-amber-400' },
  4: { icon: '☀️', label: 'Sunny', gradient: 'from-yellow-300/40 to-orange-300/40', border: 'border-yellow-400' }
}

export default function GratitudeHistory({ user, refreshTrigger }: GratitudeHistoryProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserResponses()
  }, [user?.id, refreshTrigger])

  const fetchUserResponses = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('gratitude_responses')
        .select(`
          *,
          gratitude_prompts (
            prompt,
            date
          ),
          wellbeing_checkins (
            mood_score
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setResponses(data || [])
    } catch (error) {
      console.error('Error fetching responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteResponse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gratitude_responses')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setResponses(responses.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting response:', error)
    }
  }

  const getMoodData = (response: any) => {
    const moodScore = response.wellbeing_checkins?.[0]?.mood_score
    if (moodScore && moodScore >= 1 && moodScore <= 4) {
      return MOOD_CONFIG[moodScore as 1 | 2 | 3 | 4]
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <div className="h-6 bg-gradient-to-r from-gold-200 to-peach-200 rounded-lg mb-6 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-4 border-gold-300 pl-4 mb-6 animate-pulse">
            <div className="h-4 bg-warm-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-warm-200 rounded w-3/4 mb-3"></div>
            <div className="h-16 bg-warm-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-peach-400 flex items-center justify-center shadow-md">
          <span className="text-lg">📖</span>
        </div>
        <h3 className="font-display text-2xl font-semibold text-sage-800">
          Your Gratitude Journey
        </h3>
        {responses.length > 0 && (
          <span className="font-brand text-sm bg-gold-100 text-gold-700 px-3 py-1 rounded-full">
            {responses.length} {responses.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-200 to-gold-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <p className="font-brand text-sage-600 mb-2">Your journey begins today</p>
          <p className="font-brand text-sm text-sage-500">
            Start by sharing what you&apos;re grateful for above
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
                  relative overflow-hidden border-l-4 ${mood ? mood.border : 'border-gold-400'} 
                  pl-6 py-4 rounded-r-xl hover:shadow-md transition-all duration-200
                  bg-gradient-to-r ${mood ? mood.gradient : 'from-warm-50 to-gold-50'}
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
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-brand text-sm text-sage-600 font-medium">
                            {response.gratitude_prompts?.date ? 
                              new Date(response.gratitude_prompts.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Unknown date'
                            }
                          </p>
                          {mood && (
                            <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              <span className="text-base">{mood.icon}</span>
                              <span className="text-xs font-brand font-medium text-sage-600">
                                {mood.label}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="font-brand text-xs text-sage-500">
                          {new Date(response.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* TODO: Add edit functionality */}}
                        className="font-brand text-xs bg-periwinkle-100 text-periwinkle-700 px-3 py-1 rounded-full hover:bg-periwinkle-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteResponse(response.id)}
                        className="font-brand text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-display text-lg font-medium text-sage-800 mb-3 leading-relaxed">
                    {response.gratitude_prompts?.prompt || 'Personal reflection'}
                  </h4>
                  
                  <p className="font-brand text-sage-700 leading-relaxed bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    {response.is_onboarding_response && 
                      response.response_text.startsWith('I am grateful I started this daily practice because') ? 
                      response.response_text : 
                      response.response_text
                    }
                  </p>
                </div>
              </div>
            )
          })}
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