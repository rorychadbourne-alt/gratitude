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

  const getLongestSunnyStreak = () => {
    let maxStreak = 0
    let currentStreak = 0
    
    checkins.forEach(checkin => {
      if (checkin.mood_score === 4) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })
    
    return maxStreak
  }

  const getMoodDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 }
    checkins.forEach(checkin => {
      distribution[checkin.mood_score as 1 | 2 | 3 | 4]++
    })
    return distribution
  }

  const getMostCommonMood = () => {
    const distribution = getMoodDistribution()
    const entries = Object.entries(distribution) as [string, number][]
    const sorted = entries.sort((a, b) => b[1] - a[1])
    return sorted[0]?.[1] > 0 ? parseInt(sorted[0][0]) as 1 | 2 | 3 | 4 : null
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

  const getConsistencyRate = () => {
    if (checkins.length === 0) return 0
    const daysInPeriod = 30
    return Math.round((checkins.length / daysInPeriod) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-warm-200 rounded-lg mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gradient-to-r from-warm-100 to-peach-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (checkins.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
        <h3 className="font-display text-xl font-semibold text-sage-800 mb-4">
          Mood Insights
        </h3>
        <div className="text-center py-8 bg-gradient-to-br from-periwinkle-50 to-warm-50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">💡</span>
          </div>
          <p className="font-brand text-sage-600 mb-2">No insights yet</p>
          <p className="font-brand text-sm text-sage-500">
            Check in daily to discover your mood patterns
          </p>
        </div>
      </div>
    )
  }

  const currentStreak = getCurrentStreak()
  const longestSunnyStreak = getLongestSunnyStreak()
  const mostCommonMood = getMostCommonMood()
  const trend = getImprovementTrend()
  const consistency = getConsistencyRate()
  const distribution = getMoodDistribution()

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
          <span className="text-lg">💡</span>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-sage-800">
            Your Mood Insights
          </h3>
          <p className="font-brand text-xs text-sage-600">
            Last 30 days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔥</span>
            <span className="font-display text-3xl font-bold text-orange-800">
              {currentStreak}
            </span>
          </div>
          <p className="font-brand text-sm font-semibold text-orange-900">Day Streak</p>
          <p className="font-brand text-xs text-orange-700 mt-1">
            {currentStreak > 0 ? "Keep it going!" : "Start your streak today"}
          </p>
        </div>

        {mostCommonMood && (
          <div className="bg-gradient-to-br from-periwinkle-50 to-periwinkle-100 rounded-xl p-4 border border-periwinkle-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{MOOD_CONFIG[mostCommonMood].icon}</span>
              <span className="font-display text-3xl font-bold text-periwinkle-800">
                {Math.round((distribution[mostCommonMood] / checkins.length) * 100)}%
              </span>
            </div>
            <p className="font-brand text-sm font-semibold text-periwinkle-900">
              Mostly {MOOD_CONFIG[mostCommonMood].label}
            </p>
            <p className="font-brand text-xs text-periwinkle-700 mt-1">
              Your most frequent mood
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✅</span>
            <span className="font-display text-3xl font-bold text-green-800">
              {consistency}%
            </span>
          </div>
          <p className="font-brand text-sm font-semibold text-green-900">Consistency</p>
          <p className="font-brand text-xs text-green-700 mt-1">
            {consistency >= 80 ? "Amazing dedication!" : consistency >= 50 ? "Great progress!" : "Keep building the habit"}
          </p>
        </div>

        {longestSunnyStreak > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">☀️</span>
              <span className="font-display text-3xl font-bold text-yellow-800">
                {longestSunnyStreak}
              </span>
            </div>
            <p className="font-brand text-sm font-semibold text-yellow-900">Sunny Days</p>
            <p className="font-brand text-xs text-yellow-700 mt-1">
              Your longest sunny streak
            </p>
          </div>
        )}
      </div>

      {trend && (
        <div className={`rounded-xl p-4 border ${
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
                {trend.improving ? 'Your mood is improving!' :
                 trend.stable ? 'Your mood is stable' :
                 'Keep checking in'}
              </p>
              <p className="font-brand text-xs" style={{
                color: trend.improving ? '#047857' : trend.stable ? '#0284c7' : '#b45309'
              }}>
                {trend.improving ? 'You\'ve been feeling better compared to earlier this month. Keep up the great work!' :
                 trend.stable ? 'Your mood has remained consistent. Continue your self-care routine.' :
                 'Everyone has ups and downs. Be kind to yourself and keep showing up.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="font-brand text-sm font-semibold text-sage-700 mb-3">Mood Breakdown</p>
        <div className="space-y-2">
          {Object.entries(distribution).reverse().map(([score, count]) => {
            const mood = MOOD_CONFIG[parseInt(score) as 1 | 2 | 3 | 4]
            const percentage = checkins.length > 0 ? (count / checkins.length) * 100 : 0
            
            if (count === 0) return null
            
            return (
              <div key={score} className="flex items-center gap-3">
                <span className="text-xl">{mood.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-brand text-xs text-sage-600">{mood.label}</span>
                    <span className="font-brand text-xs font-semibold text-sage-700">
                      {count} days ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
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