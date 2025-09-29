'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import UserProfile from '../../components/profile/UserProfile'
import Navigation from '../../components/ui/Navigation'
import { usePushNotifications } from '../../utils/pushNotifications'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const router = useRouter()

  const {
    isSupported,
    permission,
    isSubscribed,
    loading: notificationsLoading,
    enableNotifications,
    disableNotifications 
  } = usePushNotifications()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      } catch (error) {
        console.log('Profile not found')
        setProfile(null)
      }
      
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleToggleNotifications = async () => {
    console.log('Toggle clicked! Current state:', { isSubscribed, savingNotifications, notificationsLoading })
    
    if (!user) {
      console.log('No user found')
      return
    }
    
    if (savingNotifications) {
      console.log('Already saving, ignoring click')
      return
    }
    
    setSavingNotifications(true)
    setNotificationMessage('')

    try {
      if (isSubscribed) {
        console.log('Disabling notifications...')
        const result = await disableNotifications()
        console.log('Disable result:', result)
        setNotificationMessage('Notifications disabled')
      } else {
        console.log('Enabling notifications...')
        const result = await enableNotifications({
          userId: user.id,
          reminderTime: '19:00',
          reminderDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
        console.log('Enable result:', result)

        if (result.success) {
          setNotificationMessage('Notifications enabled!')
        } else {
          setNotificationMessage('Failed to enable notifications')
        }
      }

      setTimeout(() => setNotificationMessage(''), 3000)
    } catch (error) {
      console.error('Error toggling notifications:', error)
      setNotificationMessage('An error occurred')
      setTimeout(() => setNotificationMessage(''), 3000)
    } finally {
      setSavingNotifications(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-morning-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-periwinkle-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-brand">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isDisabled = savingNotifications || notificationsLoading

  return (
    <div className="min-h-screen bg-morning-gradient">
      {/* Mobile-Optimized Navigation */}
      <Navigation currentPage="profile" />

      <div className="px-4 py-6 sm:py-8 max-w-2xl mx-auto">
        <UserProfile user={user} profile={profile} />

        {/* Notification Settings */}
        <div className="mt-6 bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Daily Reminder
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get a gentle notification once per day to add your gratitude entry
              </p>
              {!isSupported && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3 border border-amber-200">
                  Push notifications aren&apos;t supported in your browser
                </p>
              )}
              {permission === 'denied' && (
                <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-3 border border-red-200">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>

            {isSupported && permission !== 'denied' && (
              <button
                type="button"
                onClick={handleToggleNotifications}
                disabled={isDisabled}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-periwinkle-500 focus:ring-offset-2
                  ${isSubscribed ? 'bg-periwinkle-500' : 'bg-gray-200'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                `}
                role="switch"
                aria-checked={isSubscribed}
                aria-label="Toggle daily reminder notifications"
              >
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 
                    transition duration-200 ease-in-out
                    ${isSubscribed ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            )}
          </div>

          {notificationMessage && (
            <div className={`
              mt-4 px-4 py-2.5 rounded-lg text-sm font-medium text-center
              ${notificationMessage.includes('enabled') ? 'bg-green-50 text-green-800 border border-green-200' : ''}
              ${notificationMessage.includes('disabled') ? 'bg-gray-50 text-gray-800 border border-gray-200' : ''}
              ${notificationMessage.includes('Failed') || notificationMessage.includes('error') ? 'bg-red-50 text-red-800 border border-red-200' : ''}
            `}>
              {notificationMessage}
            </div>
          )}

          {isSupported && permission !== 'denied' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="inline-block mr-1">ℹ️</span>
                Due to free tier limitations, you&apos;ll receive one notification per day at a consistent time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}