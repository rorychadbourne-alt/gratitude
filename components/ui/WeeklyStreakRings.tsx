'use client'

import { useState } from 'react'

interface WeeklyStreakRingsProps {
  ringsCompleted: number // 0-5
  size?: number
  className?: string
}

export default function WeeklyStreakRings({ 
  ringsCompleted, 
  size = 60, 
  className = "" 
}: WeeklyStreakRingsProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Ring configurations from outer to inner
  const rings = [
    { radius: 26, strokeWidth: 3, ring: 1 },
    { radius: 22, strokeWidth: 3, ring: 2 },
    { radius: 18, strokeWidth: 3, ring: 3 },
    { radius: 14, strokeWidth: 3, ring: 4 },
    { radius: 10, strokeWidth: 4, ring: 5 }, // Center circle
  ]

  const center = size / 2
  const circumference = (radius: number) => 2 * Math.PI * radius

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {rings.map(({ radius, strokeWidth, ring }) => {
          const isCompleted = ringsCompleted >= ring
          const circumf = circumference(radius)
          
          return (
            <g key={ring}>
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f7e4b8"
                strokeWidth={strokeWidth}
                opacity={0.3}
              />
              
              {/* Progress circle */}
              {isCompleted && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill={ring === 5 ? "#f2d485" : "none"}
                  stroke="#edc55f"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumf}
                  strokeDashoffset={0}
                  className="transition-all duration-500 ease-out"
                  style={{
                    animation: isCompleted ? `fillRing 0.6s ease-out ${(ring - 1) * 0.1}s both` : 'none'
                  }}
                />
              )}
            </g>
          )
        })}
        
        {/* Center dove emoji - only show when 5 rings completed */}
        {ringsCompleted >= 5 && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-sm transform rotate-90 origin-center"
            style={{ animation: 'doveAppear 0.8s ease-out 0.5s both' }}
          >
            🕊️
          </text>
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-10">
          This week: {ringsCompleted} of 5 days
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
        </div>
      )}

      <style jsx>{`
        @keyframes fillRing {
          from {
            stroke-dashoffset: ${circumference(26)};
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        
        @keyframes doveAppear {
          from {
            opacity: 0;
            transform: rotate(90deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(90deg) scale(1);
          }
        }
      `}</style>
    </div>
  )
}