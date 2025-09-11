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
  const [error, setError] = useState<string | null>(null)
  const [circlePreview, setCirclePreview] = useState<any>(null)

  const handleInviteCodeChange = async (code: string) => {
    setInviteCode(code)
    setError(null)
    setCirclePreview(null)

    // Auto-lookup circle when code is complete (assuming 8 character codes)
    if (code.length === 8) {
      try {
        const { data: circleData } = await supabase
          .from('circles')
          .select('id, name, description, ring_color, center_emoji')
          .eq('invite_code', code.toUpperCase())
          .single()

        if (circleData) {
          setCirclePreview(circleData)
        }
      } catch (error) {
        // Silently handle - will show error on submit if needed
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setLoading(true)
    setError(null)

    try {
      const normalizedCode = inviteCode.trim().toUpperCase()

      // First, find the circle
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('id, name')
        .eq('invite_code', normalizedCode)
        .single()

      if (circleError || !circleData) {
        throw new Error('Invalid invite code. Please check and try again.')
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('circle_members')
        .select('id')
        .eq('circle_id', circleData.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        throw new Error('You are already a member of this circle.')
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleData.id,
          user_id: user.id,
          role: 'member'
        })

      if (memberError) throw memberError

      onCircleJoined()
    } catch (error: any) {
      console.error('Error joining circle:', error)
      setError(error.message || 'Failed to join circle')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatInviteCode = (code: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    // Add dashes for readability: XXXX-XXXX
    if (cleaned.length > 4) {
      return cleaned.substring(0, 4) + '-' + cleaned.substring(4, 8)
    }
    return cleaned
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-0 sm:p-4">
        {/* Modal Content - Full screen on mobile, centered on desktop */}
        <div className="relative w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl bg-white shadow-xl transform transition-all">
          {/* Mobile Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sm:border-none">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900">
              Join Circle
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Instructions */}
            <div className="bg-periwinkle-50 rounded-xl p-4 mb-6 border border-periwinkle-100">
              <h3 className="font-brand font-semibold text-periwinkle-800 mb-2">
                How to join a circle
              </h3>
              <ul className="text-sm text-periwinkle-700 font-brand space-y-1">
                <li>• Get an invite code from a circle creator</li>
                <li>• Enter the 8-character code below</li>
                <li>• Start sharing gratitude with your community</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-brand">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Invite Code Input */}
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 font-brand mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={formatInviteCode(inviteCode)}
                  onChange={(e) => handleInviteCodeChange(e.target.value.replace(/[^A-Z0-9]/gi, ''))}
                  placeholder="XXXX-XXXX"
                  maxLength={9} // Including the dash
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent font-mono text-lg text-center tracking-wider uppercase"
                  style={{ fontSize: '18px' }} // Slightly larger for easier reading
                />
                <p className="mt-2 text-xs text-gray-500 font-brand text-center">
                  Enter the 8-character code shared by the circle creator
                </p>
              </div>

              {/* Circle Preview */}
              {circlePreview && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ 
                        backgroundColor: circlePreview.ring_color === 'gold' ? '#fefdfb' : 
                                          circlePreview.ring_color === 'sage' ? '#f8f9f6' :
                                          circlePreview.ring_color === 'peach' ? '#fef8f4' : '#f4f3ff'
                      }}
                    >
                      {circlePreview.center_emoji || '🤝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-green-800 truncate">
                        {circlePreview.name}
                      </h4>
                      <p className="text-sm text-green-700 font-brand line-clamp-2">
                        {circlePreview.description || 'A gratitude sharing circle'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-brand font-medium bg-green-100 text-green-800">
                        Found!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse space-y-reverse space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-brand font-medium transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inviteCode.trim() || loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white px-6 py-3 rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 disabled:cursor-not-allowed font-brand font-medium transition-all shadow-md min-h-[48px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </span>
                  ) : (
                    'Join Circle'
                  )}
                </button>
              </div>
            </form>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-brand font-medium text-gray-700 mb-3">
                Need an invite code?
              </h4>
              <div className="text-sm text-gray-600 font-brand space-y-2">
                <p>• Ask someone who's already in the circle you want to join</p>
                <p>• Circle creators can share invite codes from their circle settings</p>
                <p>• You can also create your own circle to invite others</p>
              </div>
              <button
                onClick={() => {
                  onClose()
                  // Could trigger create circle modal here if you want
                }}
                className="mt-3 text-periwinkle-600 hover:text-periwinkle-800 font-brand text-sm underline"
              >
                Create your own circle instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}