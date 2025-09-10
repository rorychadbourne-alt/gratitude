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
      
      // Get circles user belongs to with explicit typing
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

      // Get community data for each circle
      const communityData = await Promise.all(
        userCircles.map(async (uc: UserCircle) => {
          const circle = uc.circles
          
          // Add type safety check
          if (!circle?.id || !circle?.name) {
            return null
          }
          
          // Get total members count
          const { count: totalMembers } = await supabase
            .from('circle_members')
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circle.id)

          // Get real community streak data
          const { data: streakData } = await getCurrentCommunityStreak(circle.id)
          
          // Get today's participation
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

      // Filter out null values
      const validCommunityData = communityData.filter(Boolean) as Community[]
      setCommunities(validCommunityData)
      
      // Auto-select first community
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
      
      // Get member IDs for this specific community
      const memberIds = await getCircleMemberIds(communityId)

      if (memberIds.length === 0) {
        setResponses([])
        return
      }

      // Get response IDs that were shared with this circle
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

      // Get the actual responses with user profiles for display names
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
    // Use display name if available, otherwise fall back to a generic name
    if (response.profiles?.display_name) {
      return response.profiles.display_name
    }
    
    // Fallback for users who haven't set display names yet
    return `Community Member`
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
            <div className="h-4 bg-warm-200 rounded w-1/4