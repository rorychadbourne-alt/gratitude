'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ShareModal from '../ui/ShareModal'
import { updateWeeklyStreak } from '../../lib/streakHelpers'
import { updateCommunityStreak } from '../../lib/communityStreakHelpers'
import { useToast } from '../ui/ToastProvider'
import { createToastHelpers } from '../../lib/toastHelpers'

interface DailyPromptProps {
  user: any
  onNewResponse?: () => void
}

export default function DailyPrompt({ user, onNewResponse }: DailyPromptProps) {
  const [prompt, setPrompt] = useState<any>(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [userCircles, setUserCircles] = useState<any[]>([])
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  
  const toast = useToast()
  const toasts = createToastHelpers(toast)

  useEffect(() => {
    fetchTodaysPrompt()
    fetchUserCircles()
  }, [user?.id])

  // Add milestone check function
  const checkForMilestone = async (userId: string) => {
    try {
      const { count } = await supabase
        .from('gratitude_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_onboarding_response', false)

      if (count && [10, 25, 50, 100].includes(count)) {
        toasts.milestoneAchieved(count)
      }
    } catch (error) {
      console.error('Error checking milestone:', error)
    }
  }

  const fetchTodaysPrompt = async () => {
    if (!user?.id) return
    
    try {
      const { data: promptData, error: promptError } = await supabase
        .from('gratitude_prompts')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      if (promptError) {
        console.error('Error fetching prompt:', promptError)
      } else {
        setPrompt(promptData)

        const { data: responseData } = await supabase
          .from('gratitude_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('prompt_id', promptData.id)
          .eq('is_onboarding_response', false)
          .single()

        if (responseData) {
          setExistingResponse(responseData)
          setResponse(responseData.response_text)
        }
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCircles = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          circles (
            id,
            name
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const circles = data?.map(item => item.circles).filter(Boolean) || []
      
      // Transform for modal format with mock data
      const transformedCircles = circles.map((circle: any, index: number) => ({
        id: circle.id,
        name: circle.name,
        memberCount: Math.floor(Math.random() * 10) + 3, // Mock - replace with real query
        streak: Math.floor(Math.random() * 20) + 1, // Mock - replace with real calculation
        sharedToday: Math.floor(Math.random() * 5), // Mock - replace with real query
        color: ['orange', 'blue', 'purple', 'green', 'pink'][index % 5]
      }))
      
      setUserCircles(transformedCircles)
    } catch (error) {
      console.error('Error fetching user circles:', error)
    }
  }

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim() || response.length > 1000) return

    if (!existingResponse) {
      // Show modal for new responses
      setShowShareModal(true)
    } else {
      // Direct submit for updates
      handleDirectSubmit()
    }
  }

  const handleShare = async (selectedCircleIds: string[], responseText: string) => {
    setSubmitting(true)
    setMessage(null)

    try {
      console.log('Creating response with circles:', selectedCircleIds)
      
      // Create the gratitude response
      const { data: responseData, error: responseError } = await supabase
        .from('gratitude_responses')
        .insert({
          user_id: user.id,
          prompt_id: prompt.id,
          response_text: responseText.trim(),
          is_onboarding_response: false
        })
        .select()
        .single()

      if (responseError) throw responseError
      console.log('Response created:', responseData.id)

      // Update individual weekly streak
      await updateWeeklyStreak(user.id)

      // Handle circle sharing and community streak updates
      if (selectedCircleIds.length > 0) {
        console.log('Linking response to circles...')
        
        const circleInserts = selectedCircleIds.map(circleId => ({
          response_id: responseData.id,
          circle_id: circleId
        }))

        const { error: circlesError } = await supabase
          .from('response_circles')
          .insert(circleInserts)

        if (circlesError) {
          console.error('Error linking response to circles:', circlesError)
          throw circlesError
        } else {
          console.log('Response linked to circles successfully')
          
          try {
            await Promise.all(
              selectedCircleIds.map(circleId => updateCommunityStreak(circleId))
            )
          } catch (streakError) {
            console.error('Error updating community streaks:', streakError)
          }
        }
      }
      
      setExistingResponse(responseData)
      toasts.gratitudeShared() // Replace setMessage with toast
      await checkForMilestone(user.id) // Check for milestone
      setShowShareModal(false)
      
      // Trigger refresh of both feeds
      if (onNewResponse) {
        onNewResponse()
      }
      
      // Force refresh after a short delay to ensure data consistency
      setTimeout(() => {
        if (onNewResponse) {
          onNewResponse()
        }
      }, 500)
      
    } catch (error: any) {
      console.error('Submit error:', error)
      setMessage(`Error: ${error.message}`)
      setShowShareModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDirectSubmit = async () => {
    if (!response.trim() || !prompt || !user?.id) return

    if (response.trim().length > 1000) {
      setMessage('Response must be less than 1000 characters')
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const { data, error } = await supabase
        .from('gratitude_responses')
        .update({ response_text: response.trim() })
        .eq('id', existingResponse.id)
        .select()
        .single()

      if (error) throw error
      
      setExistingResponse(data)
      toasts.gratitudeShared() // Replace setMessage with toast
      
      if (onNewResponse) {
        onNewResponse()
      }
      
    } catch (error: any) {
      console.error('Submit error:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-periwinkle-50 via-warm-50 to-gold-100 rounded-xl shadow-lg border border-periwinkle-200 p-4 sm:p-8 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-gold-200 rounded-lg mb-6"></div>
        <div className="h-32 bg-gradient-to-r from-warm-200 to-peach-200 rounded-lg mb-6"></div>
        <div className="h-12 bg-gradient-to-r from-periwinkle-300 to-gold-300 rounded-xl"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="bg-gradient-to-br from-periwinkle-50 via-warm-50 to-gold-100 rounded-xl shadow-lg border border-periwinkle-200 p-4 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-peach-300 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🌅</span>
        </div>
        <p className="font-brand text-sage-600">No prompt available for today.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-periwinkle-50 via-warm-50 to-gold-100 rounded-xl shadow-lg border border-periwinkle-200 p-4 sm:p-8">
        {/* Prompt Display */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
          <div className="mb-4">
            <h3 className="font-brand text-sm font-medium text-sage-600 mb-1">Today's Gratitude</h3>
            <p className="font-brand text-xs text-sage-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <p className="font-display text-lg sm:text-xl text-sage-800 font-medium leading-relaxed">
            {prompt.prompt}
          </p>
        </div>

        {/* Error Message (keeping for validation errors) */}
        {message && (
          <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 font-brand font-medium text-center text-sm sm:text-base ${
            message.includes('Error') || message.includes('must be') 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmitClick} className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-brand text-sm font-medium text-sage-700">
                Share your thoughts
              </label>
              <span className={`font-brand text-sm ${response.length > 900 ? 'text-orange-600' : 'text-sage-500'}`}>
                {response.length}/1000
              </span>
            </div>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Share your response..."
              required
              rows={4}
              maxLength={1000}
              className="w-full px-3 sm:px-4 py-3 border border-white/50 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent resize-none font-brand text-sage-800 placeholder-sage-400 transition-all duration-200 shadow-sm text-base"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !response.trim() || response.length > 1000}
            className="w-full bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-4 px-6 rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 disabled:cursor-not-allowed font-brand font-medium transition-all duration-200 shadow-md hover:shadow-lg text-base min-h-[48px] active:scale-[0.98]"
          >
            {submitting ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sharing...</span>
              </span>
            ) : existingResponse ? (
              'Update Response'
            ) : (
              'Share Gratitude'
            )}
          </button>
        </form>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        responseText={response}
        userCircles={userCircles}
        isSubmitting={submitting}
      />
    </>
  )
}