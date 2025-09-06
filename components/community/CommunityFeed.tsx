'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface CommunityFeedProps {
  user: any
}

export default function CommunityFeed({ user }: CommunityFeedProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityResponses()
  }, [user?.id])

  const fetchCommunityResponses = async () => {
    if (!user?.id) return

    try {
      console.log('Fetching community responses for user:', user.id)
      
      // Get circles user belongs to
      const { data: userCircles, error: circlesError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user.id)

      console.log('User circles:', userCircles)
      if (circlesError) throw circlesError
      
      const circleIds = userCircles?.map(c => c.circle_id) || []
      console.log('Circle IDs:', circleIds)
      
      if (circleIds.length === 0) {
        console.log('No circles found for user')
        setResponses([])
        setLoading(false)
        return
      }

      // Get response IDs that were shared with these circles
      const { data: sharedResponseIds, error: sharedError } = await supabase
        .from('response_circles')
        .select('response_id, circle_id')
        .in('circle_id', circleIds)

      console.log('Shared response IDs:', sharedResponseIds)
      if (sharedError) throw sharedError

      const responseIds = sharedResponseIds?.map(sr => sr.response_id) || []
      console.log('Response IDs to fetch:', responseIds)

      if (responseIds.length === 0) {
        console.log('No shared responses found')
        setResponses([])
        setLoading(false)
        return
      }

      // Get the actual responses
      const { data: communityResponses, error: responsesError } = await supabase
        .from('gratitude_responses')
        .select(`
          *,
          gratitude_prompts (
            prompt,
            date
          )
        `)
        .in('id', responseIds)
        .order('created_at', { ascending: false })

      console.log('Final community responses:', communityResponses)
      if (responsesError) throw responsesError

      setResponses(communityResponses || [])
    } catch (error) {
      console.error('Error fetching community responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (response: any) => {
    // For now, show a shortened user ID since profiles table isn't linked
    return `Community Member ${response.user_id.slice(0, 8)}`
  }

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

  if (responses.length === 0) {
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
          <p className="font-brand text-sage-600 mb-2">No shared responses yet</p>
          <p className="font-brand text-sm text-sage-500 max-w-sm mx-auto">
            When you and your circle members share gratitude with circles, it will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-periwinkle-400 to-periwinkle-500 flex items-center justify-center shadow-md">
          <span className="text-lg">🤝</span>
        </div>
        <h3 className="font-display text-2xl font-semibold text-sage-800">
          Community Feed
        </h3>
        <span className="font-brand text-sm bg-periwinkle-100 text-periwinkle-700 px-3 py-1 rounded-full">
          {responses.length} shared {responses.length === 1 ? 'response' : 'responses'}
        </span>
      </div>
      
      <div className="space-y-6">
        {responses.map((response) => (
          <div
            key={response.id}
            className="border-l-4 border-periwinkle-400 pl-6 py-4 bg-gradient-to-r from-periwinkle-50 to-warm-50 rounded-r-xl hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-periwinkle-300 to-periwinkle-400 flex items-center justify-center">
                  <span className="text-xs font-brand font-bold text-white">
                    {response.user_id.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-brand font-medium text-sage-800">
                    {getDisplayName(response)}
                    {response.user_id === user.id && (
                      <span className="ml-2 text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </span>
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
            
            <p className="font-brand text-sage-700 leading-relaxed bg-white/60 p-4 rounded-lg">
              {response.response_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}