'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface GratitudeHistoryProps {
  user: any
  refreshTrigger?: number
}

export default function GratitudeHistory({ user, refreshTrigger }: GratitudeHistoryProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [updating, setUpdating] = useState(false)

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
  }, [user?.id])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses, refreshTrigger])

  const startEdit = (response: any) => {
    setEditingId(response.id)
    setEditText(response.response_text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = async (responseId: string) => {
    if (!editText.trim()) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('gratitude_responses')
        .update({ response_text: editText.trim() })
        .eq('id', responseId)

      if (error) throw error

      setResponses(responses.map(r => 
        r.id === responseId 
          ? { ...r, response_text: editText.trim() }
          : r
      ))
      
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Error updating response:', error)
    } finally {
      setUpdating(false)
    }
  }

  const deleteResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this gratitude entry?')) return

    try {
      const { error } = await supabase
        .from('gratitude_responses')
        .delete()
        .eq('id', responseId)

      if (error) throw error

      setResponses(responses.filter(r => r.id !== responseId))
    } catch (error) {
      console.error('Error deleting response:', error)
    }
  }

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
        <p className="text-gray-500 mb-4">You haven&apos;t shared any gratitude yet.</p>
        <p className="text-sm text-gray-400">Start by responding to today&apos;s prompt above!</p>
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
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-400">
                {new Date(response.created_at).toLocaleDateString()}
              </p>
              <div className="flex space-x-1">
                {editingId === response.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(response.id)}
                      disabled={updating}
                      className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={updating}
                      className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(response)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteResponse(response.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm font-medium text-gray-700 mb-2">
            {response.gratitude_prompts?.prompt || 'Unknown prompt'}
          </p>
          
          {editingId === response.id ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm"
              rows={3}
            />
          ) : (
            <p className="text-gray-900 leading-relaxed">
              {response.response_text}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}