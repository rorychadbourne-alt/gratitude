'use client'

interface CommunityStreakRingsProps {
  ringsCompleted: number // 0-5
  todayActive: number
  totalMembers: number
  ringColor?: string // 'periwinkle', 'gold', 'sage', etc.
  centerEmoji?: string
  size?: number
  className?: string
  isSelected?: boolean
}

export default function CommunityStreakRings({ 
  ringsCompleted, 
  todayActive,
  totalMembers,
  ringColor = 'periwinkle',
  centerEmoji = '🤝',
  size = 64, 
  className = "",
  isSelected = false
}: CommunityStreakRingsProps) {
  // Color mappings for different themes
  const colorThemes = {
    periwinkle: { stroke: '#4f46e5', fill: '#6366f1', bg: '#f4f3ff' },
    gold: { stroke: '#e6b143', fill: '#edc55f', bg: '#fefdfb' },
    sage: { stroke: '#6f7d5c', fill: '#8a9b75', bg: '#f8f9f6' },
    peach: { stroke: '#dd6639', fill: '#ec8051', bg: '#fef8f4' }
  }

  const theme = colorThemes[ringColor as keyof typeof colorThemes] || colorThemes.periwinkle

  // Ring configurations
  const rings = [
    { radius: 28, strokeWidth: 3, ring: 1 },
    { radius: 24, strokeWidth: 3, ring: 2 },
    { radius: 20, strokeWidth: 3, ring: 3 },
    { radius: 16, strokeWidth: 3, ring: 4 },
    { radius: 12, strokeWidth: 4, ring: 5 },
  ]

  const center = size / 2

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        className={`transform -rotate-90 transition-all duration-200 ${
          isSelected ? 'scale-110 drop-shadow-lg' : ''
        }`}
      >
        {rings.map(({ radius, strokeWidth, ring }) => {
          const isCompleted = ringsCompleted >= ring
          
          return (
            <g key={ring}>
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={theme.bg}
                strokeWidth={strokeWidth}
                opacity={0.4}
              />
              
              {/* Progress circle */}
              {isCompleted && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill={ring === 5 ? theme.fill : "none"}
                  stroke={theme.stroke}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-500 ease-out"
                  style={{
                    animation: `fillRing 0.6s ease-out ${(ring - 1) * 0.1}s both`
                  }}
                />
              )}
            </g>
          )
        })}
        
        {/* Center emoji - only show when 5 rings completed */}
        {ringsCompleted >= 5 && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg transform rotate-90 origin-center"
            style={{ 
              fontSize: '18px',
              animation: 'emojiCelebrate 0.8s ease-out'
            }}
          >
            {centerEmoji}
          </text>
        )}
      </svg>

      {/* Activity indicator */}
      {todayActive > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 rounded-full flex items-center justify-center">
          <span className="text-xs font-brand font-bold text-white">
            {todayActive}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes fillRing {
          from {
            stroke-dashoffset: 100;
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        
        @keyframes emojiCelebrate {
          0%, 100% { transform: rotate(90deg) scale(1); }
          50% { transform: rotate(90deg) scale(1.2); }
        }
      `}</style>
    </div>
  )
}