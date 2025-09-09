'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import CommunityStreakRings from '../ui/CommunityStreakRings'

interface CircleCustomizationProps {
  circle: {
    id: string
    name: string
    ring_color: string
    center_emoji: string
    created_by: string
  }
  user: any
  onClose: () => void
  onUpdate: (updatedCircle: any) => void
}

const colorThemes = [
  { id: 'periwinkle', name: 'Periwinkle', primary: '#4f46e5', description: 'Classic and trustworthy' },
  { id: 'gold', name: 'Warm Gold', primary: '#e6b143', description: 'Cheerful and optimistic' },
  { id: 'sage', name: 'Sage Green', primary: '#6f7d5c', description: 'Natural and calming' },
  { id: 'peach', name: 'Soft Peach', primary: '#dd6639', description: 'Warm and welcoming' }
]

const emojiOptions = [
  '🙏', '💝', '🌸', '🌿', '☀️', '🌱', 
  '🕊️', '💫', '🌺', '🍃', '🌻', '🦋',
  '🌙', '✨', '🌾', '🏔️', '🌊', '🌳'
]

export default function CircleCustomization({ circle, user, onClose, onUpdate }: CircleCustomizationProps) {
  const [selectedColor, setSelectedColor] = useState(circle.ring_color || 'periwinkle')
  const [selectedEmoji, setSelectedEmoji] = useState(circle.center_emoji || '🙏')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCreator = circle.created_by === user?.id

  if (!isCreator) {
    return null // Only creators can customize
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('circles')
        .update({
          ring_color: selectedColor,
          center_emoji: selectedEmoji
        })
        .eq('id', circle.id)
        .select()
        .single()

      if (updateError) throw updateError

      onUpdate({
        ...circle,
        ring_color: selectedColor,
        center_emoji: selectedEmoji
      })
      
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-sage-800">
              Customize {circle.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Preview */}
          <div className="text-center mb-8">
            <h3 className="font-brand text-sm font-medium text-sage-600 mb-4">Preview</h3>
            <div className="flex justify-center">
              <CommunityStreakRings
                ringsCompleted={5} // Show full preview
                todayActive={2}
                totalMembers={3}
                ringColor={selectedColor}
                centerEmoji={selectedEmoji}
                size={80}
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-8">
            <h3 className="font-brand text-sm font-medium text-sage-700 mb-4">Ring Color</h3>
            <div className="grid grid-cols-2 gap-3">
              {colorThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedColor(theme.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedColor === theme.id
                      ? 'border-periwinkle-500 bg-periwinkle-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    ></div>
                    <span className="font-brand text-sm font-medium text-sage-800">
                      {theme.name}
                    </span>
                  </div>
                  <p className="font-brand text-xs text-sage-500">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Selection */}
          <div className="mb-8">
            <h3 className="font-brand text-sm font-medium text-sage-700 mb-4">Center Symbol</h3>
            <div className="grid grid-cols-6 gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                    selectedEmoji === emoji
                      ? 'border-periwinkle-500 bg-periwinkle-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg font-brand text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-brand font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white rounded-lg font-brand font-medium hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}