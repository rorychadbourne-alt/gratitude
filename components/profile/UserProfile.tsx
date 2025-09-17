'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/ToastProvider'
import { createToastHelpers } from '../../lib/toastHelpers'

interface UserProfileProps {
  user: any
  profile: any
}

export default function UserProfile({ user, profile }: UserProfileProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  
  const toast = useToast()
  const toasts = createToastHelpers(toast)

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      setMessage('Display name cannot be empty')
      return
    }

    if (displayName.trim().length > 50) {
      setMessage('Display name must be 50 characters or less')
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id)

      if (error) throw error

      setIsEditingName(false)
      toasts.displayNameUpdated() // Replace setMessage with toast
      
    } catch (error: any) {
      console.error('Error updating display name:', error)
      setMessage('Error updating display name. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setDisplayName(profile?.display_name || '')
    setIsEditingName(false)
    setMessage(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header - Mobile Optimized */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-periwinkle-400 to-gold-400 flex items-center justify-center shadow-lg">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {(displayName || user?.email?.charAt(0) || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-sage-800">Profile</h1>
            <p className="font-brand text-sage-600 text-sm sm:text-base">Manage your gratitude circle identity</p>
          </div>
        </div>
        
        {/* Error Message (keeping for validation errors) */}
        {message && (
          <div className={`p-3 sm:p-4 rounded-xl mb-6 font-brand font-medium text-sm ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Display Name Section - Mobile Optimized */}
        <div className="bg-gradient-to-r from-periwinkle-50 to-warm-100 rounded-xl p-4 sm:p-6 border border-periwinkle-200">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-4">
            <div>
              <label className="block font-brand text-sm font-medium text-sage-700 mb-1">
                Display Name
              </label>
              <p className="font-brand text-xs text-sage-500">
                This is how you appear to others in your gratitude circles
              </p>
            </div>
            {!isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-periwinkle-600 hover:text-periwinkle-800 font-brand text-sm underline py-2 px-1 min-h-[44px]"
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditingName ? (
            <div className="space-y-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className="w-full px-4 py-3 border border-periwinkle-300 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent font-brand text-base"
                style={{ fontSize: '16px' }} // Prevents zoom on iOS
              />
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleSaveDisplayName}
                  disabled={saving || !displayName.trim()}
                  className="flex-1 bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-3 px-4 rounded-lg hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 font-brand font-medium transition-all min-h-[48px]"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-brand font-medium transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="font-brand text-lg text-periwinkle-800 font-medium">
              {displayName || 'Not set'}
            </p>
          )}
        </div>
      </div>

      {/* Account Information - Mobile Optimized */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold text-sage-800 mb-6">
          Account Information
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block font-brand text-sm font-medium text-sage-700 mb-2">
              Email Address
            </label>
            <p className="font-brand text-sage-800 bg-gray-50 px-3 py-2 rounded-lg text-sm sm:text-base">
              {user?.email || 'No email'}
            </p>
          </div>
          
          <div>
            <label className="block font-brand text-sm font-medium text-sage-700 mb-2">
              Member Since
            </label>
            <p className="font-brand text-sage-800 text-sm sm:text-base">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'}
            </p>
          </div>

          <div>
            <label className="block font-brand text-sm font-medium text-sage-700 mb-2">
              Onboarding Status
            </label>
            <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-brand font-medium ${
              profile?.onboarding_completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile?.onboarding_completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy & Settings - Mobile Optimized */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold text-sage-800 mb-4">
          Privacy & Settings
        </h3>
        <div className="text-sm font-brand text-sage-600 space-y-2">
          <p>• Your display name is visible to members of circles you join</p>
          <p>• Your email address is never shared with other users</p>
          <p>• You can change your display name anytime</p>
        </div>
      </div>
    </div>
  )
}