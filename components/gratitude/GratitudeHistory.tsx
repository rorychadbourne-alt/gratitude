'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../lib/supabase'

interface GratitudeHistoryProps {
  user: any
}

export default function GratitudeHistory({ user }: GratitudeHistoryProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const fetchResponses = useCallback(async () => {
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

      if (error) throw error
      setResponses(data || [])
    } catch (error) {
      console.error('Error fetching responses:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500 mb-4">You haven't shared any gratitude yet.</p>
        <p className="text-sm text-gray-400">Start by responding to today's prompt above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Gratitude Journey ({responses.length} entries)
      </h3>
      
      {responses.map((response) => (
        <div key={response.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-500">
              {response.gratitude_prompts?.date ? new Date(response.gratitude_prompts.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown date'}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(response.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <p className="text-sm font-medium text-gray-700 mb-2">
            {response.gratitude_prompts?.prompt || 'Unknown prompt'}
          </p>
          
          <p className="text-gray-900 leading-relaxed">
            {response.response_text}
          </p>
        </div>
      ))}
    </div>
  )
}