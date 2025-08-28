'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../lib/supabase'

interface DailyPromptProps {
  user: any
}

export default function DailyPrompt({ user }: DailyPromptProps) {
  const [prompt, setPrompt] = useState<any>(null)
  const [response, setResponse] = useState('')
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchTodaysPrompt = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Get today's prompt
      const { data: promptData, error: promptError } = await supabase
        .from('gratitude_prompts')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      if (promptError) {
        console.error('Error fetching prompt:', promptError)
        return
      }

      setPrompt(promptData)

      // Check if user already responded today
      const { data: responseData } = await supabase
        .from('gratitude_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('prompt_id', promptData.id)
        .single()

      if (responseData) {
        setExistingResponse(responseData)
        setResponse(responseData.response_text)
      }

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    fetchTodaysPrompt()
  }, [fetchTodaysPrompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim() || !prompt || !user?.id) return

    setSubmitting(true)
    setMessage(null)

    try {
      if (existingResponse) {
        // Update existing response
        const { error } = await supabase
          .from('gratitude_responses')
          .update({ response_text: response.trim() })
          .eq('id', existingResponse.id)

        if (error) throw error
        setMessage('Your response has been updated! ✨')
      } else {
        // Create new response
        const { error } = await supabase
          .from('gratitude_responses')
          .insert({
            user_id: user.id,
            prompt_id: prompt.id,
            response_text: response.trim()
          })

        if (error) throw error
        setMessage('Thank you for sharing your gratitude! ✨')
        
        // Fetch the created response
        fetchTodaysPrompt()
      }
    } catch (error: any) {
      setMessage('Error saving your response. Please try again.')
      console.error('Error:', error)
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
          Today's Gratitude Prompt
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
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share what you&apos;re grateful for..."
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !response.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {submitting ? 'Saving...' : existingResponse ? 'Update Response' : 'Share Gratitude'}
        </button>
      </form>
    </div>
  )
}