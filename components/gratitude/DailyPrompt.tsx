'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import MultiSelect from '../ui/MultiSelect'
import WeeklyStreakRings from '../ui/WeeklyStreakRings'
import { getCurrentWeekStreak, updateWeeklyStreak } from '../../lib/streakHelpers'
import { updateCommunityStreak } from '../../lib/communityStreakHelpers'

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
  const [selectedCircles, setSelectedCircles] = useState<string[]>([])
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const [weeklyStreak, setWeeklyStreak] = useState({ rings_completed: 0 })

  useEffect(() => {
    fetchTodaysPrompt()
    fetchUserCircles()
    fetchWeeklyStreak()
  }, [user?.id])

  const fetchWeeklyStreak = async () => {
    if (!user?.id) return

    try {
      const { data } = await getCurrentWeekStreak(user.id)
      if (data) {
        setWeeklyStreak(data)
      }
    } catch (error) {
      console.error('Error fetching weekly streak:', error)
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
      setUserCircles(circles)
    } catch (error) {
      console.error('Error fetching user circles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim() || !prompt || !user?.id) return

    if (response.trim().length > 1000) {
      setMessage('Response must be less than 1000 characters')
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      if (existingResponse) {
        const { data, error } = await supabase
          .from('gratitude_responses')
          .update({ response_text: response.trim() })
          .eq('id', existingResponse.id)
          .select()
          .single()

        if (error) throw error
        
        setExistingResponse(data)
        setMessage('Your response has been updated!')
      } else {
        // Create the gratitude response
        const { data: responseData, error: responseError } = await supabase
          .from('gratitude_responses')
          .insert({
            user_id: user.id,
            prompt_id: prompt.id,
            response_text: response.trim(),
            is_onboarding_response: false
          })
          .select()
          .single()

        if (responseError) throw responseError

        // Update individual weekly streak for new responses only
        const { data: updatedStreak } = await updateWeeklyStreak(user.id)
        if (updatedStreak) {
          setWeeklyStreak(updatedStreak)
        }

        // Handle circle sharing and community streak updates
        if (selectedCircles.length > 0) {
          const circleInserts = selectedCircles.map(circleId => ({
            response_id: responseData.id,
            circle_id: circleId
          }))

          const { error: circlesError } = await supabase
            .from('response_circles')
            .insert(circleInserts)

          if (circlesError) {
            console.error('Error linking response to circles:', circlesError)
          } else {
            // Update community streak for each circle this response was shared with
            try {
              await Promise.all(
                selectedCircles.map(circleId => updateCommunityStreak(circleId))
              )
            } catch (streakError) {
              console.error('Error updating community streaks:', streakError)
              // Don't fail the whole operation if streak update fails
            }
          }
        }
        
        setExistingResponse(responseData)
        setMessage('Thank you for sharing your gratitude!')
      }
      
      setSelectedCircles([])
      
      if (onNewResponse) {
        onNewResponse()
      }
      
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error: any) {
      console.error('Submit error:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-periwinkle-50 via-warm-50 to-gold-100 rounded-xl shadow-lg border border-periwinkle-200 p-8 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-gold-200 rounded-lg mb-6"></div>
        <div className="h-32 bg-gradient-to-r from-warm-200 to-peach-200 rounded-lg mb-6"></div>
        <div className="h-12 bg-gradient-to-r from-periwinkle-300 to-gold-300 rounded-xl"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="bg-gradient-to-br from-periwinkle-50 via-warm-50 to-gold-100 rounded-xl shadow-lg border border-periwinkle-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-peach-300 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🌅</span>
        </div>
        <p className="font-brand text-sage-600">No prompt available for today.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-periwinkle-50 via-warm-50 to-gold-100 rounded-xl shadow-lg border border-periwinkle-200 p-8">
      {/* Prompt Display */}
      <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-brand text-sm font-medium text-sage-600 mb-1">Today&apos;s Gratitude</h3>
            <p className="font-brand text-xs text-sage-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Weekly Streak Ring */}
          <WeeklyStreakRings 
            ringsCompleted={weeklyStreak.rings_completed} 
            size={60}
          />
        </div>
        
        <p className="font-display text-xl text-sage-800 font-medium leading-relaxed">
          {prompt.prompt}
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className={`p-4 rounded-xl mb-6 font-brand font-medium text-center ${
          message.includes('Error') || message.includes('must be') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-white/50 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent resize-none font-brand text-sage-800 placeholder-sage-400 transition-all duration-200 shadow-sm"
          />
        </div>

        {userCircles.length > 0 && (
          <div>
            <label className="block font-brand text-sm font-medium text-sage-700 mb-3">
              Share with circles (optional)
            </label>
            <MultiSelect
              options={userCircles.map(circle => ({ id: circle.id, name: circle.name }))}
              selected={selectedCircles}
              onChange={setSelectedCircles}
              placeholder="Choose circles to share with..."
            />
            <p className="font-brand text-xs text-sage-500 mt-2">
              Your response will be visible to members of selected circles. Leave empty to keep private.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !response.trim() || response.length > 1000}
          className="w-full bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-4 px-6 rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-brand font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
  )
}