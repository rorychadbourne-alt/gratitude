'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface JoinCircleProps {
  user: any
  onCircleJoined: () => void
}

export default function JoinCircle({ user, onCircleJoined }: JoinCircleProps) {
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
          user_id: user.id
        })

      if (memberError) throw memberError

      setInviteCode('')
      setMessage(`Successfully joined "${circleData.name}"!`)
      onCircleJoined()

    } catch (error: any) {
      console.error('Error joining circle:', error)
      setMessage('Error joining circle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Join a Circle</h3>
      
      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('Error') || message.includes('Invalid') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : message.includes('already')
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="GRAT-XXXXXX"
            required
            maxLength={11}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the invite code someone shared with you
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !inviteCode.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Joining...' : 'Join Circle'}
        </button>
      </form>
    </div>
  )
}