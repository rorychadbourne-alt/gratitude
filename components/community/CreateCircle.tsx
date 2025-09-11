'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface CreateCircleProps {
  user: any
  onClose: () => void
  onCircleCreated: () => void
}

const RING_COLORS = [
  { name: 'Periwinkle', value: 'periwinkle', bg: 'bg-periwinkle-100', ring: 'ring-periwinkle-500' },
  { name: 'Gold', value: 'gold', bg: 'bg-gold-100', ring: 'ring-gold-500' },
  { name: 'Sage', value: 'sage', bg: 'bg-sage-100', ring: 'ring-sage-500' },
  { name: 'Peach', value: 'peach', bg: 'bg-peach-100', ring: 'ring-peach-500' }
]

const EMOJIS = ['🙏', '💝', '🌟', '🌸', '🌿', '☀️', '🤝', '💫', '🌺', '✨', '🕊️', '🦋']

export default function CreateCircle({ user, onClose, onCircleCreated }: CreateCircleProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ringColor, setRingColor] = useState('periwinkle')
  const [centerEmoji, setCenterEmoji] = useState('🙏')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Create the circle
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          created_by: user.id,
          ring_color: ringColor,
          center_emoji: centerEmoji
        })
        .select()
        .single()

      if (circleError) throw circleError

      // Add creator as member
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleData.id,
          user_id: user.id,
          role: 'creator'
        })

      if (memberError) throw memberError

      onCircleCreated()
    } catch (error: any) {
      console.error('Error creating circle:', error)
      setError(error.message || 'Failed to create circle')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
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
              Create New Circle
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

          {/* Error Message */}
          {error && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-brand">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Circle Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-brand mb-2">
                Circle Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter circle name"
                required
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent font-brand text-base"
                style={{ fontSize: '16px' }} // Prevents zoom on iOS
              />
              <p className="mt-1 text-xs text-gray-500 font-brand">
                {name.length}/50 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 font-brand mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your gratitude circle..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent resize-none font-brand text-base"
                style={{ fontSize: '16px' }} // Prevents zoom on iOS
              />
              <p className="mt-1 text-xs text-gray-500 font-brand">
                {description.length}/200 characters
              </p>
            </div>

            {/* Ring Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-brand mb-3">
                Ring Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RING_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setRingColor(color.value)}
                    className={`p-3 rounded-xl border-2 transition-all min-h-[56px] ${
                      ringColor === color.value
                        ? `${color.bg} ${color.ring} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                        color.value === 'periwinkle' ? 'bg-periwinkle-400' :
                        color.value === 'gold' ? 'bg-gold-400' :
                        color.value === 'sage' ? 'bg-sage-400' : 'bg-peach-400'
                      }`}></div>
                      <span className="text-xs font-brand font-medium text-gray-700">
                        {color.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Center Emoji */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-brand mb-3">
                Center Emoji
              </label>
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCenterEmoji(emoji)}
                    className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center text-xl sm:text-2xl min-h-[48px] ${
                      centerEmoji === emoji
                        ? 'border-periwinkle-500 bg-periwinkle-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 font-brand mb-3">Preview</h4>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                  style={{ 
                    backgroundColor: ringColor === 'gold' ? '#fefdfb' : 
                                      ringColor === 'sage' ? '#f8f9f6' :
                                      ringColor === 'peach' ? '#fef8f4' : '#f4f3ff'
                  }}
                >
                  {centerEmoji}
                </div>
                <div>
                  <h5 className="font-display font-semibold text-gray-900">
                    {name || 'Circle Name'}
                  </h5>
                  <p className="text-sm text-gray-600 font-brand">
                    {description || 'A gratitude sharing circle'}
                  </p>
                </div>
              </div>
            </div>

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
                disabled={!name.trim() || loading}
                className="w-full sm:w-auto bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white px-6 py-3 rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 disabled:cursor-not-allowed font-brand font-medium transition-all shadow-md min-h-[48px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </span>
                ) : (
                  'Create Circle'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}