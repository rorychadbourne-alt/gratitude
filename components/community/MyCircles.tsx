'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface MyCirclesProps {
  user: any
  refreshTrigger?: number
}

export default function MyCircles({ user, refreshTrigger }: MyCirclesProps) {
  const [circles, setCircles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [leavingCircle, setLeavingCircle] = useState<string | null>(null)

  useEffect(() => {
    fetchMyCircles()
  }, [user?.id, refreshTrigger])

  const fetchMyCircles = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          id,
          joined_at,
          circles (
            id,
            name,
            description,
            invite_code,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (error) throw error
      setCircles(data || [])
    } catch (error) {
      console.error('Error fetching circles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveCircle = async (membershipId: string, circleName: string) => {
    if (!confirm(`Are you sure you want to leave "${circleName}"?`)) return

    setLeavingCircle(membershipId)
    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('id', membershipId)

      if (error) throw error

      setCircles(circles.filter(c => c.id !== membershipId))
    } catch (error) {
      console.error('Error leaving circle:', error)
    } finally {
      setLeavingCircle(null)
    }
  }

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy invite code:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Circles</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (circles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Circles</h3>
        <p className="text-gray-500 text-center py-8">
          You haven&apos;t joined any circles yet. Create one or join using an invite code!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        My Circles ({circles.length})
      </h3>
      
      <div className="space-y-4">
        {circles.map((membership) => (
          <div key={membership.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">
                  {membership.circles.name}
                  {membership.circles.created_by === user.id && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Creator
                    </span>
                  )}
                </h4>
                {membership.circles.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {membership.circles.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleLeaveCircle(membership.id, membership.circles.name)}
                disabled={leavingCircle === membership.id}
                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {leavingCircle === membership.id ? 'Leaving...' : 'Leave'}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div>
                <p className="text-xs text-gray-500">Invite Code:</p>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {membership.circles.invite_code}
                </code>
              </div>
              <button
                onClick={() => copyInviteCode(membership.circles.invite_code)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Copy Code
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Joined {new Date(membership.joined_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}