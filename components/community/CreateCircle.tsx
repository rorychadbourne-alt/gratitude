'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface CreateCircleProps {
  user: any
  onCircleCreated: () => void
}

export default function CreateCircle({ user, onCircleCreated }: CreateCircleProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [createdCode, setCreatedCode] = useState<string | null>(null)

  const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789' // Removed confusing chars like 0, O, I, L
    let result = 'GRAT-'
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !user?.id) return

    setLoading(true)
    setMessage(null)
    setCreatedCode(null)

    try {
      const inviteCode = generateInviteCode()
      
      // Create the circle
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          invite_code: inviteCode,
          created_by: user.id
        })
        .select()
        .single()

      if (circleError) throw circleError

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleData.id,
          user_id: user.id
        })

      if (memberError) throw memberError

      setName('')
      setDescription('')
      setCreatedCode(inviteCode)
      setMessage('Circle created successfully!')
      onCircleCreated()

    } catch (error: any) {
      console.error('Error creating circle:', error)
      if (error.code === '23505') {
        // Duplicate invite code (very rare)
        setMessage('Error generating invite code. Please try again.')
      } else {
        setMessage('Error creating circle. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Circle</h3>
      
      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {createdCode ? (
            <div>
              <p className="font-medium">{message}</p>
              <p className="text-sm mt-2">Share this invite code with others:</p>
              <div className="mt-2 p-3 bg-white rounded border font-mono text-center text-lg font-bold tracking-wider">
                {createdCode}
              </div>
              <p className="text-xs mt-2">Anyone with this code can join your circle</p>
            </div>
          ) : (
            message
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Circle Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Family Gratitude, Work Team, Close Friends"
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this circle about?"
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Circle'}
        </button>
      </form>
    </div>
  )
}