'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface CreateCircleProps {
  user: any
  onClose: () => void
  onCircleCreated: () => void
}

export default function CreateCircle({ user, onClose, onCircleCreated }: CreateCircleProps) {
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
          created_by: user.id,
          ring_color: 'periwinkle', // Default color
          center_emoji: '🙏' // Default emoji
        })
        .select()
        .single()

      if (circleError) throw circleError

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleData.id,
          user_id: user.id,
          role: 'creator'
        })

      if (memberError) throw memberError

      setName('')
      setDescription('')
      setCreatedCode(inviteCode)
      setMessage('Circle created successfully!')
      
      // Close modal after a brief delay to show success
      setTimeout(() => {
        onCircleCreated()
      }, 2000)

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-semibold text-sage-800">
              Create New Circle
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl mb-6 font-brand ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {createdCode ? (
                <div>
                  <p className="font-medium">{message}</p>
                  <p className="text-sm mt-2">Share this invite code with others:</p>
                  <div className="mt-3 p-3 bg-white rounded-lg border font-mono text-center text-lg font-bold tracking-wider text-periwinkle-700">
                    {createdCode}
                  </div>
                  <p className="text-xs mt-2 text-center">Anyone with this code can join your circle</p>
                </div>
              ) : (
                message
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-brand text-sm font-medium text-sage-700 mb-2">
                Circle Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Family Gratitude, Work Team, Close Friends"
                required
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent font-brand transition-all"
              />
            </div>

            <div>
              <label className="block font-brand text-sm font-medium text-sage-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this circle about?"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent font-brand resize-none transition-all"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-brand font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 disabled:cursor-not-allowed font-brand font-medium transition-all"
              >
                {loading ? 'Creating...' : 'Create Circle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}