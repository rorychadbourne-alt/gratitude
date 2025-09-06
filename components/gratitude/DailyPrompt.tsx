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
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No prompt available for today.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Today&apos;s Gratitude Prompt
        </h2>
        <p className="text-gray-600 text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-lg text-gray-800 font-medium leading-relaxed">
          {prompt.prompt}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('Error') || message.includes('must be') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Share your thoughts</span>
            <span className={response.length > 900 ? 'text-orange-600' : 'text-gray-400'}>
              {response.length}/1000
            </span>
          </div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share what you&apos;re grateful for..."
            required
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
          />
        </div>

        {userCircles.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with circles (optional)
            </label>
            <MultiSelect
              options={userCircles.map(circle => ({ id: circle.id, name: circle.name }))}
              selected={selectedCircles}
              onChange={setSelectedCircles}
              placeholder="Choose circles to share with..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Your response will be visible to members of selected circles. Leave empty to keep private.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !response.trim() || response.length > 1000}
          className="w-full bg-periwinkle-500 text-white py-3 px-6 rounded-lg hover:bg-periwinkle-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {submitting ? 'Sharing...' : existingResponse ? 'Update Response' : 'Share Gratitude'}
        </button>
      </form>
    </div>
  )
}