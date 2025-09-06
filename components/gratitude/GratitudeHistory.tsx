'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface GratitudeHistoryProps {
  user: any
  refreshTrigger: number
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
          {responses.map((response) => (
            <div
              key={response.id}
              className="border-l-4 border-gold-400 pl-6 py-4 bg-gradient-to-r from-warm-50 to-gold-50 rounded-r-xl hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-brand text-sm text-sage-600 font-medium">
                    {response.gratitude_prompts?.date ? 
                      new Date(response.gratitude_prompts.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown date'
                    }
                  </p>
                  <p className="font-brand text-xs text-sage-500">
                    {new Date(response.created_at).toLocaleDateString()}
                  </p>
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
              
              <p className="font-brand text-sage-700 leading-relaxed bg-white/60 p-4 rounded-lg">
                {response.is_onboarding_response && 
                  response.response_text.startsWith('I am grateful I started this daily practice because') ? 
                  response.response_text : 
                  response.response_text
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}