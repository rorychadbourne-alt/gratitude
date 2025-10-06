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

const MOOD_OPTIONS = [
  { score: 1, icon: '⛈️', label: 'Stormy', gradient: 'from-slate-400 to-slate-500' },
  { score: 2, icon: '🌧️', label: 'Rainy', gradient: 'from-blue-400 to-blue-500' },
  { score: 3, icon: '⛅', label: 'Cloudy', gradient: 'from-amber-300 to-amber-400' },
  { score: 4, icon: '☀️', label: 'Sunny', gradient: 'from-yellow-400 to-orange-400' }
]

export default function DailyPrompt({ user, onNewResponse }: DailyPromptProps) {
  const [prompt, setPrompt] = useState<any>(null)
  const [response, setResponse] = useState('')
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [userCircles, setUserCircles] = useState<any[]>([])
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const [existingMood, setExistingMood] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  
  const toast = useToast()
  const toasts = createToastHelpers(toast)

  useEffect(() => {
    fetchTodaysPrompt()
    fetchUserCircles()
  }, [user?.id])

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
      const today = new Date().toISOString().split('T')[0]
      
      const { data: promptData, error: promptError } = await supabase
        .from('gratitude_prompts')
        .select('*')
        .eq('date', today)
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

        const { data: moodData } = await supabase
          .from('wellbeing_checkins')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single()

        if (moodData) {
          setExistingMood(moodData)
          setMoodScore(moodData.mood_score)
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
      
      const transformedCircles = circles.map((circle: any, index: number) => ({
        id: circle.id,
        name: circle.name,
        memberCount: Math.floor(Math.random() * 10) + 3,
        streak: Math.floor(Math.random() * 20) + 1,
        sharedToday: Math.floor(Math.random() * 5),
        color: ['orange', 'blue', 'purple', 'green', 'pink'][index % 5]
      }))
      
      setUserCircles(transformedCircles)
    } catch (error) {
      console.error('Error fetching user circles:', error)
    }
  }

  const saveMoodCheckin = async (responseId: string) => {
    if (moodScore === null) return

    try {
      const today = new Date().toISOString().split('T')[0]
      
      if (existingMood) {
        await supabase
          .from('wellbeing_checkins')
          .update({ 
            mood_score: moodScore,
            response_id: responseId
          })
          .eq('id', existingMood.id)
      } else {
        await supabase
          .from('wellbeing_checkins')
          .insert({
            user_id: user.id,
            response_id: responseId,
            mood_score: moodScore,
            date: today
          })
      }
    } catch (error) {
      console.error('Error saving mood check-in:', error)
    }
  }

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim() || response.length > 1000) return
    if (moodScore === null) {
      setMessage('Please select your weather for today')
      return
    }

    if (!existingResponse) {
      setShowShareModal(true)
    } else {
      handleDirectSubmit()
    }
  }

  const handleShare = async (selectedCircleIds: string[], responseText: string) => {
    setSubmitting(true)
    setMessage(null)

    try {
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

      await saveMoodCheckin(responseData.id)
      await updateWeeklyStreak(user.id)

      if (selectedCircleIds.length > 0) {
        const circleInserts = selectedCircleIds.map(circleId => ({
          response_id: responseData.id,
          circle_id: circleId
        }))

        const { error: circlesError } = await supabase
          .from('response_circles')
          .insert(circleInserts)

        if (circlesError) throw circlesError
          
        try {
          await Promise.all(
            selectedCircleIds.map(circleId => updateCommunityStreak(circleId))
          )
        } catch (streakError) {
          console.error('Error updating community streaks:', streakError)
        }
      }
      
      setExistingResponse(responseData)
      toasts.gratitudeShared()
      await checkForMilestone(user.id)
      setShowShareModal(false)
      
      if (onNewResponse) {
        onNewResponse()
      }
      
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

    if (moodScore === null) {
      setMessage('Please select your weather for today')
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
      
      await saveMoodCheckin(existingResponse.id)
      
      setExistingResponse(data)
      toasts.gratitudeShared()
      
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
      <div className="bg-gradient-to-b from-warm-100 via-periwinkle-50 to-white rounded-2xl shadow-lg border border-periwinkle-200 p-5 sm:p-8 relative">
        {/* Floating Date Badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gold-100 text-gold-800 px-3 py-1.5 rounded-full font-brand text-xs font-semibold">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {/* Prominent Prompt */}
        <div className="pr-20 mb-6">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-sage-900 leading-tight">
            {prompt.prompt}
          </h3>
        </div>

        {/* Error/Validation Message */}
        {message && (
          <div className={`p-3 sm:p-4 rounded-xl mb-4 font-brand font-medium text-center text-sm ${
            message.includes('Error') || message.includes('must be') || message.includes('select')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Unified Input Card */}
        <form onSubmit={handleSubmitClick} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
            {/* Textarea */}
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Share your thoughts..."
              required
              rows={3}
              maxLength={1000}
              className="w-full border-none focus:ring-0 resize-none font-brand text-sage-800 placeholder-sage-400 text-base sm:text-lg mb-3 outline-none"
              style={{ fontSize: '16px' }}
            />

            {/* Subtle Mood Pills - Inline */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-brand text-xs text-sage-500 mr-1">Feeling:</span>
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.score}
                    type="button"
                    onClick={() => setMoodScore(mood.score)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 text-xs font-brand font-medium
                      ${moodScore === mood.score 
                        ? `bg-gradient-to-r ${mood.gradient} text-white border shadow-sm` 
                        : 'bg-gray-100 text-sage-600 hover:bg-gray-200 border border-transparent'
                      }
                    `}
                  >
                    <span className="text-base">{mood.icon}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Character Count */}
              <span className={`font-brand text-xs whitespace-nowrap ml-2 ${response.length > 900 ? 'text-orange-600' : 'text-sage-400'}`}>
                {response.length}/1000
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !response.trim() || response.length > 1000 || moodScore === null}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-brand font-bold transition-all duration-200 shadow-lg hover:shadow-xl text-base uppercase tracking-wide min-h-[56px] active:scale-[0.98]"
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