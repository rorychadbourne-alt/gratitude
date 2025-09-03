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
      // Get all circles the user belongs to
      const { data: userCircles, error: circlesError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user.id)

      if (circlesError) throw circlesError

      const circleIds = userCircles?.map(c => c.circle_id) || []

      if (circleIds.length === 0) {
        setResponses([])
        setLoading(false)
        return
      }

      // Get all members of these circles
      const { data: allMembers, error: membersError } = await supabase
        .from('circle_members')
        .select(`
          user_id,
          circles (
            id,
            name
          )
        `)
        .in('circle_id', circleIds)

      if (membersError) throw membersError

      const memberUserIds = Array.from(new Set(allMembers?.map(m => m.user_id) || []))

      if (memberUserIds.length === 0) {
        setResponses([])
        setLoading(false)
        return
      }

      // Get all responses from these users
      const { data: communityResponses, error: responsesError } = await supabase
        .from('gratitude_responses')
        .select(`
          *,
          gratitude_prompts (
            prompt,
            date
          ),
          profiles (
            full_name,
            email
          )
        `)
        .in('user_id', memberUserIds)
        .order('created_at', { ascending: false })
        .limit(50)

      if (responsesError) throw responsesError

      // Add circle information to each response
      const responsesWithCircles = communityResponses?.map(response => {
        const userMemberships = allMembers?.filter(m => m.user_id === response.user_id) || []
        return {
          ...response,
          user_circles: userMemberships.map(m => m.circles)
        }
      }) || []

      setResponses(responsesWithCircles)
    } catch (error) {
      console.error('Error fetching community responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (response: any) => {
    if (response.profiles?.full_name) {
      return response.profiles.full_name
    }
    if (response.profiles?.email) {
      return response.profiles.email.split('@')[0]
    }
    return 'Anonymous'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Feed</h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Feed</h3>
        <p className="text-gray-500 mb-4">No community responses yet.</p>
        <p className="text-sm text-gray-400">
          Join some circles and encourage members to share their gratitude!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Community Feed ({responses.length} responses)
      </h3>
      
      {responses.map((response) => (
        <div key={response.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {getDisplayName(response)}
                {response.user_id === user.id && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    You
                  </span>
                )}
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex flex-wrap gap-1">
                {response.user_circles.map((circle: any, index: number) => (
                  <span
                    key={circle.id}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {circle.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {new Date(response.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {response.gratitude_prompts?.date ? 
                  new Date(response.gratitude_prompts.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  }) : 'Unknown date'
                }
              </p>
            </div>
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