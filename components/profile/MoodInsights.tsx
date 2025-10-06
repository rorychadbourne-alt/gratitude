'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface MoodInsightsProps {
  userId: string
}

interface WellbeingCheckin {
  id: string
  mood_score: number
  date: string
}

const MOOD_CONFIG = {
  1: { icon: '⛈️', label: 'Stormy' },
  2: { icon: '🌧️', label: 'Rainy' },
  3: { icon: '⛅', label: 'Cloudy' },
  4: { icon: '☀️', label: 'Sunny' }
}

export default function MoodInsights({ userId }: MoodInsightsProps) {
  const [checkins, setCheckins] = useState<WellbeingCheckin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCheckins()
  }, [userId])

  const fetchCheckins = async () => {
    setLoading(true)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      setCheckins(data || [])
    } catch (error) {
      console.error('Error fetching wellbeing check-ins:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStreak = () => {
    if (checkins.length === 0) return 0
    
    const sortedCheckins = [...checkins].reverse()
    let streak = 0
    let currentDate = new Date()
    
    for (const checkin of sortedCheckins) {
      const checkinDate = new Date(checkin.date).toISOString().split('T')[0]
      const expectedDate = currentDate.toISOString().split('T')[0]
      
      if (checkinDate === expectedDate) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  const getMoodDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 }
    checkins.forEach(checkin => {
      distribution[checkin.mood_score as 1 | 2 | 3 | 4]++
    })
    return distribution
  }

  const getImprovementTrend = () => {
    if (checkins.length < 7) return null
    
    const firstWeek = checkins.slice(0, Math.min(7, checkins.length))
    const lastWeek = checkins.slice(-7)
    
    const firstAvg = firstWeek.reduce((sum, c) => sum + c.mood_score, 0) / firstWeek.length
    const lastAvg = lastWeek.reduce((sum, c) => sum + c.mood_score, 0) / lastWeek.length
    
    const diff = lastAvg - firstAvg
    return { improving: diff > 0.3, stable: Math.abs(diff) <= 0.3, declining: diff < -0.3, diff }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-warm-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gradient-to-r from-warm-100 to-peach-100 rounded-lg"></div>
      </div>
    )
  }

  if (checkins.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
        <h3 className="font-display text-xl font-semibold text-sage-800 mb-4">
          Your Insights
        </h3>
        <div className="text-center py-8 bg-gradient-to-br from-periwinkle-50 to-warm-50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">💡</span>
          </div>
          <p className="font-brand text-sage-600 mb-2">No insights yet</p>
          <p className="font-brand text-sm text-sage-500">
            Check in daily to understand your patterns
          </p>
        </div>
      </div>
    )
  }

  const currentStreak = getCurrentStreak()
  const trend = getImprovementTrend()
  const distribution = getMoodDistribution()

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
          <span className="text-lg">💡</span>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-sage-800">
            Your Insights
          </h3>
          <p className="font-brand text-xs text-sage-600">
            Last 30 days
          </p>
        </div>
      </div>

      {/* Simplified Stats */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔥</span>
            <span className="font-display text-4xl font-bold text-orange-800">
              {currentStreak}
            </span>
          </div>
          <p className="font-brand text-base font-semibold text-orange-900">Day Check-in Streak</p>
          <p className="font-brand text-sm text-orange-700 mt-1">
            {currentStreak > 0 ? "Keep showing up for yourself" : "Start your journey today"}
          </p>
        </div>
      </div>

      {/* Trend Analysis */}
      {trend && (
        <div className={`rounded-xl p-4 mb-6 border ${
          trend.improving ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
          trend.stable ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
          'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {trend.improving ? '📈' : trend.stable ? '➡️' : '📊'}
            </span>
            <div className="flex-1">
              <p className="font-brand text-sm font-semibold mb-1" style={{
                color: trend.improving ? '#065f46' : trend.stable ? '#075985' : '#92400e'
              }}>
                {trend.improving ? 'Mood trending up' :
                 trend.stable ? 'Mood stable' :
                 'Mixed feelings'}
              </p>
              <p className="font-brand text-xs" style={{
                color: trend.improving ? '#047857' : trend.stable ? '#0284c7' : '#b45309'
              }}>
                {trend.improving ? 'You\'ve been feeling better recently compared to earlier this month.' :
                 trend.stable ? 'Your mood has remained steady over the past month.' :
                 'Your mood has varied. That\'s normal - be kind to yourself.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mood Breakdown */}
      <div className="pt-6 border-t border-gray-100">
        <p className="font-brand text-sm font-semibold text-sage-700 mb-4">How You've Been Feeling</p>
        <div className="space-y-3">
          {Object.entries(distribution).reverse().map(([score, count]) => {
            const mood = MOOD_CONFIG[parseInt(score) as 1 | 2 | 3 | 4]
            const percentage = checkins.length > 0 ? (count / checkins.length) * 100 : 0
            
            if (count === 0) return null
            
            return (
              <div key={score} className="flex items-center gap-3">
                <span className="text-xl">{mood.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-brand text-sm text-sage-700">{mood.label}</span>
                    <span className="font-brand text-xs font-semibold text-sage-600">
                      {count} {count === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        parseInt(score) === 4 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                        parseInt(score) === 3 ? 'bg-gradient-to-r from-amber-300 to-amber-400' :
                        parseInt(score) === 2 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        'bg-gradient-to-r from-slate-400 to-slate-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}