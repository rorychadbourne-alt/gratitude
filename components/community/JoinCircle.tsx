'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface JoinCircleProps {
  user: any
  onClose: () => void
  onCircleJoined: () => void
}

export default function JoinCircle({ user, onClose, onCircleJoined }: JoinCircleProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim() || !user?.id) return

    setLoading(true)
    setMessage(null)

    try {
      // Find the circle by invite code
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single()

      if (circleError || !circleData) {
        setMessage('Invalid invite code. Please check and try again.')
        setLoading(false)
        return
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('circle_members')
        .select('id')
        .eq('circle_id', circleData.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        setMessage(`You're already a member of "${circleData.name}"`)
        setLoading(false)
        return
      }

      // Add user to the circle
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleData.id,
          user_id: user.id,
          role: 'member'
        })

      if (memberError) throw memberError

      setInviteCode('')
      setMessage(`Successfully joined "${circleData.name}"!`)
      
      // Close modal after a brief delay to show success
      setTimeout(() => {
        onCircleJoined()
      }, 2000)

    } catch (error: any) {
      console.error('Error joining circle:', error)
      setMessage('Error joining circle. Please try again.')
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
              Join a Circle
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
              message.includes('Error') || message.includes('Invalid') 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : message.includes('already')
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-brand text-sm font-medium text-sage-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="GRAT-XXXXXX"
                required
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent font-mono text-center text-lg tracking-wider transition-all"
              />
              <p className="font-brand text-xs text-sage-500 mt-2 text-center">
                Enter the invite code someone shared with you
              </p>
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
                disabled={loading || !inviteCode.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-brand font-medium transition-all"
              >
                {loading ? 'Joining...' : 'Join Circle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}