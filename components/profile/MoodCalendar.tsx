'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface MoodCalendarProps {
  userId: string
}

interface DayData {
  date: string
  moodScore: number | null
  hasGratitude: boolean
}

const MOOD_CONFIG = {
  1: { icon: '⛈️', label: 'Stormy' },
  2: { icon: '🌧️', label: 'Rainy' },
  3: { icon: '⛅', label: 'Cloudy' },
  4: { icon: '☀️', label: 'Sunny' }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function MoodCalendar({ userId }: MoodCalendarProps) {
  const [monthData, setMonthData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchMonthData()
  }, [userId, currentMonth])

  const fetchMonthData = async () => {
    setLoading(true)
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const startDate = firstDay.toISOString().split('T')[0]
      const endDate = lastDay.toISOString().split('T')[0]

      const { data: moodData, error: moodError } = await supabase
        .from('wellbeing_checkins')
        .select('date, mood_score')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (moodError) throw moodError

      const { data: gratitudeData, error: gratitudeError } = await supabase
        .from('gratitude_responses')
        .select('created_at')
        .eq('user_id', userId)
        .eq('is_onboarding_response', false)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')

      if (gratitudeError) throw gratitudeError

      const moodMap = new Map(moodData?.map(m => [m.date, m.mood_score]) || [])
      const gratitudeDates = new Set(
        gratitudeData?.map(g => g.created_at.split('T')[0]) || []
      )

      const days: DayData[] = []
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0]
        days.push({
          date,
          moodScore: moodMap.get(date) || null,
          hasGratitude: gratitudeDates.has(date)
        })
      }

      setMonthData(days)
    } catch (error) {
      console.error('Error fetching month data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startingDayOfWeek = firstDay.getDay()
    
    const emptyDays = Array(startingDayOfWeek).fill(null)
    return [...emptyDays, ...monthData]
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    const today = new Date()
    const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    if (nextMonthDate <= today) {
      setCurrentMonth(nextMonthDate)
    }
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear()
  }

  const calculateStats = () => {
    const daysWithBoth = monthData.filter(d => d.moodScore !== null && d.hasGratitude).length
    const totalDaysInMonth = monthData.length
    const today = new Date().getDate()
    const daysElapsed = isCurrentMonth() ? today : totalDaysInMonth
    
    return {
      completed: daysWithBoth,
      total: daysElapsed,
      percentage: daysElapsed > 0 ? Math.round((daysWithBoth / daysElapsed) * 100) : 0
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-warm-200 rounded-lg mb-4"></div>
        <div className="h-96 bg-gradient-to-r from-warm-100 to-peach-100 rounded-lg"></div>
      </div>
    )
  }

  const stats = calculateStats()
  const days = getDaysInMonth()

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-sage-800 mb-1">
            Your Weather
          </h3>
          <p className="font-brand text-sm text-sage-600">
            Daily mood and gratitude tracking
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sage-600">←</span>
          </button>
          <span className="font-brand text-sm font-semibold text-sage-700 min-w-[120px] text-center">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth()}
            className={`p-2 rounded-lg transition-colors ${
              isCurrentMonth() ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
          >
            <span className="text-sage-600">→</span>
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-brand text-sm text-orange-900 font-semibold">
                {stats.completed} of {stats.total} days complete
              </p>
              <p className="font-brand text-xs text-orange-700">
                {stats.percentage}% this {isCurrentMonth() ? 'month so far' : 'month'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center">
              <span className="font-brand text-xs font-semibold text-sage-500">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const dayNum = parseInt(day.date.split('-')[2])
            const isToday = isCurrentMonth() && dayNum === new Date().getDate()
            const hasData = day.moodScore !== null || day.hasGratitude

            return (
              <div
                key={day.date}
                className={`
                  aspect-square rounded-lg border-2 p-1 flex flex-col items-center justify-center relative
                  ${isToday ? 'border-periwinkle-500 bg-periwinkle-50' : 'border-gray-200'}
                  ${hasData ? 'bg-white' : 'bg-gray-50'}
                `}
              >
                <span className={`font-brand text-xs font-medium mb-1 ${
                  isToday ? 'text-periwinkle-700' : 'text-sage-600'
                }`}>
                  {dayNum}
                </span>

                {day.moodScore && (
                  <span className="text-xl leading-none mb-0.5">
                    {MOOD_CONFIG[day.moodScore as 1 | 2 | 3 | 4].icon}
                  </span>
                )}

                {day.hasGratitude && (
                  <span className="text-base leading-none">
                    ✓
                  </span>
                )}

                {day.moodScore && day.hasGratitude && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">🔥</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="font-brand text-xs font-semibold text-sage-700 mb-3">Legend</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-200 flex items-center justify-center bg-white">
              <span className="text-sm">⛅</span>
            </div>
            <span className="font-brand text-sage-600">Mood tracked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-200 flex items-center justify-center bg-white">
              <span className="text-sm">✓</span>
            </div>
            <span className="font-brand text-sage-600">Gratitude shared</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-200 flex items-center justify-center bg-white relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-[8px]">🔥</span>
              </div>
            </div>
            <span className="font-brand text-sage-600">Both complete</span>
          </div>
        </div>
      </div>
    </div>
  )
}