'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import MultiSelect from '../ui/MultiSelect'

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

  useEffect(() => {
    fetchTodaysPrompt()
    fetchUserCircles()
  }, [user?.id])

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
      <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-warm-100 rounded-lg mb-6"></div>
        <div className="h-32 bg-gradient-to-r from-gray-200 to-warm-100 rounded-lg mb-6"></div>
        <div className="h-12 bg-gradient-to-r from-periwinkle-200 to-periwinkle-300 rounded-xl"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🌅</span>
        </div>
        <p className="font-brand text-gray-500">No prompt available for today.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-periwinkle-500 to-periwinkle-600 flex items-center justify-center shadow-md">
            <span className="text-xl">✨</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-gray-900">
            Today&apos;s Gratitude
          </h2>
        </div>
        <p className="font-brand text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Prompt */}
      <div className="mb-8 p-6 bg-gradient-to-br from-periwinkle-50 via-white to-warm-100 rounded-xl border border-periwinkle-100 shadow-sm">
        <p className="font-display text-xl text-gray-800 text-center font-medium leading-relaxed">
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
            <label className="font-brand text-sm font-medium text-gray-700">
              Share your thoughts
            </label>
            <span className={`font-brand text-sm ${response.length > 900 ? 'text-orange-600' : 'text-gray-400'}`}>
              {response.length}/1000
            </span>
          </div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="What fills your heart with gratitude today..."
            required
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent resize-none font-brand text-gray-900 placeholder-gray-500 transition-all duration-200"
          />
        </div>

        {userCircles.length > 0 && (
          <div>
            <label className="block font-brand text-sm font-medium text-gray-700 mb-3">
              Share with circles (optional)
            </label>
            <MultiSelect
              options={userCircles.map(circle => ({ id: circle.id, name: circle.name }))}
              selected={selectedCircles}
              onChange={setSelectedCircles}
              placeholder="Choose circles to share with..."
            />
            <p className="font-brand text-xs text-gray-500 mt-2">
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