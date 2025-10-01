'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface WellbeingCheckin {
  id: string
  mood_score: number
  date: string
  created_at: string
}

interface WellbeingGraphProps {
  userId: string
}

const MOOD_CONFIG = {
  1: { icon: '⛈️', label: 'Stormy', color: 'bg-slate-500' },
  2: { icon: '🌧️', label: 'Rainy', color: 'bg-blue-500' },
  3: { icon: '⛅', label: 'Cloudy', color: 'bg-amber-400' },
  4: { icon: '☀️', label: 'Sunny', color: 'bg-yellow-400' }
}

export default function WellbeingGraph({ userId }: WellbeingGraphProps) {
  const [checkins, setCheckins] = useState<WellbeingCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchCheckins()
  }, [userId, timeRange])

  const fetchCheckins = async () => {
    setLoading(true)
    try {
      const daysToFetch = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysToFetch)

      const { data, error } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      setCheckins(data || [])
    } catch (error) {
      console.error('Error fetching wellbeing check-ins:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverage = () => {
    if (checkins.length === 0) return '0.0'
    const sum = checkins.reduce((acc, c) => acc + c.mood_score, 0)
    return (sum / checkins.length).toFixed(1)
  }

  const getAverageMoodIcon = () => {
    const avg = parseFloat(calculateAverage())
    const roundedScore = Math.round(avg) as 1 | 2 | 3 | 4
    return MOOD_CONFIG[roundedScore]?.icon || MOOD_CONFIG[3].icon
  }

  const getMaxHeight = () => {
    return Math.max(...checkins.map(c => c.mood_score), 4)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (timeRange === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else if (timeRange === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-warm-200 rounded-lg mb-4 animate-pulse"></div>
        <div className="h-64 bg-gradient-to-r from-warm-100 to-peach-100 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-sage-800 mb-1">
            Your Weather
          </h3>
          <p className="font-brand text-sm text-sage-600">
            Track your daily mood over time
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-brand text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-periwinkle-500 text-white'
                  : 'bg-gray-100 text-sage-600 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? '7D' : range === 'month' ? '30D' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {checkins.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-periwinkle-50 to-warm-50 rounded-lg p-4">
            <p className="font-brand text-xs text-sage-600 mb-1">Average</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {getAverageMoodIcon()}
              </span>
              <span className="font-display text-2xl font-semibold text-sage-800">
                {calculateAverage()}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-warm-50 to-peach-50 rounded-lg p-4">
            <p className="font-brand text-xs text-sage-600 mb-1">Check-ins</p>
            <p className="font-display text-2xl font-semibold text-sage-800">
              {checkins.length}
            </p>
          </div>
        </div>
      )}

      {/* Graph */}
      {checkins.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-periwinkle-50 to-warm-50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">🌤️</span>
          </div>
          <p className="font-brand text-sage-600 mb-2">No weather data yet</p>
          <p className="font-brand text-sm text-sage-500">
            Start tracking your mood with daily check-ins
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Graph Container */}
          <div className="overflow-x-auto pb-4">
            <div className={`flex items-end justify-between gap-2 min-w-full ${
              timeRange === 'year' ? 'min-w-[800px]' : 
              timeRange === 'month' ? 'min-w-[600px]' : ''
            }`}>
              {checkins.map((checkin, index) => {
                const heightPercentage = (checkin.mood_score / 4) * 100
                const mood = MOOD_CONFIG[checkin.mood_score as 1 | 2 | 3 | 4]
                
                return (
                  <div
                    key={checkin.id}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    {/* Bar */}
                    <div 
                      className={`w-full ${mood.color} rounded-t-lg transition-all duration-300 hover:opacity-80 relative`}
                      style={{ height: `${Math.max(heightPercentage, 10)}%`, minHeight: '40px' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{mood.icon}</span>
                            <span className="font-semibold">{mood.label}</span>
                          </div>
                          <div className="text-gray-300">
                            {new Date(checkin.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Icon on bar */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-lg">
                        {mood.icon}
                      </div>
                    </div>
                    
                    {/* Date Label */}
                    <div className="mt-2 text-xs font-brand text-sage-500 text-center">
                      {formatDate(checkin.date)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-brand text-sage-400 pr-2">
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(MOOD_CONFIG).map(([score, config]) => (
            <div key={score} className="flex items-center gap-2">
              <span className="text-xl">{config.icon}</span>
              <span className="font-brand text-sm text-sage-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}