'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface MoodLineChartProps {
  userId: string
}

interface WellbeingCheckin {
  id: string
  mood_score: number
  date: string
}

const MOOD_CONFIG = {
  1: { icon: '⛈️', label: 'Stormy', color: '#64748b' },
  2: { icon: '🌧️', label: 'Rainy', color: '#60a5fa' },
  3: { icon: '⛅', label: 'Cloudy', color: '#fbbf24' },
  4: { icon: '☀️', label: 'Sunny', color: '#fb923c' }
}

export default function MoodLineChart({ userId }: MoodLineChartProps) {
  const [checkins, setCheckins] = useState<WellbeingCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  useEffect(() => {
    fetchCheckins()
  }, [userId, timeRange])

  const fetchCheckins = async () => {
    setLoading(true)
    try {
      const daysToFetch = timeRange === 'week' ? 7 : 30
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
    if (checkins.length === 0) return 0
    const sum = checkins.reduce((acc, c) => acc + c.mood_score, 0)
    return (sum / checkins.length).toFixed(1)
  }

  const getLineColor = () => {
    const avg = parseFloat(calculateAverage())
    if (avg >= 3.5) return '#fb923c' // Sunny
    if (avg >= 2.5) return '#fbbf24' // Cloudy
    if (avg >= 1.5) return '#60a5fa' // Rainy
    return '#64748b' // Stormy
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (timeRange === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const generateLinePath = () => {
    if (checkins.length === 0) return ''
    
    const width = 100
    const height = 100
    const padding = 10
    
    const xStep = (width - padding * 2) / (checkins.length - 1 || 1)
    const yScale = (height - padding * 2) / 3
    
    let path = ''
    checkins.forEach((checkin, index) => {
      const x = padding + index * xStep
      const y = height - padding - (checkin.mood_score - 1) * yScale
      
      if (index === 0) {
        path += `M ${x} ${y}`
      } else {
        const prevX = padding + (index - 1) * xStep
        const prevY = height - padding - (checkins[index - 1].mood_score - 1) * yScale
        const cpX = (prevX + x) / 2
        path += ` Q ${cpX} ${prevY}, ${x} ${y}`
      }
    })
    
    return path
  }

  const generateAreaPath = () => {
    if (checkins.length === 0) return ''
    
    const linePath = generateLinePath()
    const width = 100
    const height = 100
    const padding = 10
    const xStep = (width - padding * 2) / (checkins.length - 1 || 1)
    
    const lastX = padding + (checkins.length - 1) * xStep
    
    return `${linePath} L ${lastX} ${height - padding} L ${padding} ${height - padding} Z`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6 animate-pulse">
        <div className="h-6 bg-gradient-to-r from-periwinkle-200 to-warm-200 rounded-lg mb-4"></div>
        <div className="h-64 bg-gradient-to-r from-warm-100 to-peach-100 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-periwinkle-100 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-sage-800 mb-1">
            Mood Trends
          </h3>
          <p className="font-brand text-sm text-sage-600">
            Track how your weather changes over time
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-brand text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-periwinkle-500 text-white'
                  : 'bg-gray-100 text-sage-600 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? '7D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      {checkins.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-periwinkle-50 to-warm-50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">📈</span>
          </div>
          <p className="font-brand text-sage-600 mb-2">No mood data yet</p>
          <p className="font-brand text-sm text-sage-500">
            Start tracking your daily mood to see trends
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-periwinkle-50 to-warm-50 rounded-lg p-4">
              <p className="font-brand text-xs text-sage-600 mb-1">Average</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {MOOD_CONFIG[Math.round(parseFloat(calculateAverage())) as 1 | 2 | 3 | 4].icon}
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
            <div className="bg-gradient-to-br from-gold-50 to-amber-50 rounded-lg p-4">
              <p className="font-brand text-xs text-sage-600 mb-1">Best Day</p>
              <p className="text-2xl">
                {MOOD_CONFIG[Math.max(...checkins.map(c => c.mood_score)) as 1 | 2 | 3 | 4].icon}
              </p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <svg viewBox="0 0 100 100" className="w-full h-48" preserveAspectRatio="none">
              {[1, 2, 3, 4].map((level) => (
                <line
                  key={level}
                  x1="10"
                  y1={100 - 10 - ((level - 1) * (100 - 20) / 3)}
                  x2="90"
                  y2={100 - 10 - ((level - 1) * (100 - 20) / 3)}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              ))}
              
              <path
                d={generateAreaPath()}
                fill={`url(#gradient)`}
                opacity="0.2"
              />
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getLineColor()} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={getLineColor()} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              <path
                d={generateLinePath()}
                fill="none"
                stroke={getLineColor()}
                strokeWidth="2"
                strokeLinecap="round"
              />
              
              {checkins.map((checkin, index) => {
                const x = 10 + index * ((100 - 20) / (checkins.length - 1 || 1))
                const y = 100 - 10 - ((checkin.mood_score - 1) * (100 - 20) / 3)
                
                return (
                  <g key={checkin.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={hoveredPoint === index ? "3" : "2"}
                      fill="white"
                      stroke={getLineColor()}
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint(index)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer transition-all"
                    />
                    {hoveredPoint === index && (
                      <>
                        <rect
                          x={x - 15}
                          y={y - 25}
                          width="30"
                          height="20"
                          rx="4"
                          fill="#1e293b"
                          opacity="0.9"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          fill="white"
                          fontSize="8"
                          fontWeight="600"
                        >
                          {MOOD_CONFIG[checkin.mood_score as 1 | 2 | 3 | 4].icon} {MOOD_CONFIG[checkin.mood_score as 1 | 2 | 3 | 4].label}
                        </text>
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
            
            <div className="flex justify-between mt-2">
              {checkins.map((checkin, index) => {
                if (timeRange === 'month' && index % 3 !== 0 && index !== checkins.length - 1) {
                  return <div key={checkin.id} className="flex-1" />
                }
                return (
                  <div key={checkin.id} className="flex-1 text-center">
                    <span className="text-xs font-brand text-sage-500">
                      {formatDate(checkin.date)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-around mt-4 pt-4 border-t border-gray-100">
            {Object.entries(MOOD_CONFIG).map(([score, config]) => (
              <div key={score} className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <span className="font-brand text-xs text-sage-600">{config.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}