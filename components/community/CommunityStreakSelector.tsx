'use client'

import CommunityStreakRings from '../ui/CommunityStreakRings'

interface Community {
  id: string
  name: string
  ringsCompleted: number
  todayActive: number
  totalMembers: number
  ring_color?: string
  center_emoji?: string
}

interface CommunityStreakSelectorProps {
  communities: Community[]
  selectedCommunityId: string | null
  onCommunitySelect: (communityId: string) => void
}

export default function CommunityStreakSelector({ 
  communities, 
  selectedCommunityId, 
  onCommunitySelect 
}: CommunityStreakSelectorProps) {
  if (communities.length === 0) return null

  return (
    <div className="mb-4 sm:mb-6">
      {/* Mobile scroll hint */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-brand text-xs text-sage-500">Your communities</span>
        {communities.length > 1 && (
          <span className="font-brand text-xs text-sage-400">← Swipe to see all →</span>
        )}
      </div>
      
      <div className="relative">
        {/* Horizontal scroll container - Mobile optimized */}
        <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-3 scrollbar-hide scroll-smooth px-1">
          {communities.map((community) => {
            const isSelected = selectedCommunityId === community.id
            
            return (
              <button
                key={community.id}
                onClick={() => onCommunitySelect(community.id)}
                className={`flex-shrink-0 text-center p-3 sm:p-4 rounded-xl transition-all duration-200 hover:bg-white/50 active:scale-95 min-w-[80px] sm:min-w-[90px] ${
                  isSelected ? 'bg-white/60 shadow-md' : ''
                }`}
                style={{ minHeight: '48px' }} // Ensures touch target
              >
                {/* Community Streak Ring - Mobile sized */}
                <div className="mb-2 sm:mb-3">
                  <CommunityStreakRings
                    ringsCompleted={community.ringsCompleted}
                    todayActive={community.todayActive}
                    totalMembers={community.totalMembers}
                    ringColor={community.ring_color}
                    centerEmoji={community.center_emoji}
                    size={64}
                    isSelected={isSelected}
                  />
                </div>
                
                {/* Community Info */}
                <div className="text-center">
                  <p className={`font-brand text-xs font-medium truncate w-16 sm:w-20 mb-1 ${
                    isSelected ? 'text-sage-800' : 'text-sage-600'
                  }`}>
                    {community.name}
                  </p>
                  <p className="font-brand text-xs text-sage-500">
                    {community.totalMembers} {community.totalMembers === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Gradient fade indicators for scroll - Hidden on small screens to save space */}
        <div className="hidden sm:block absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="hidden sm:block absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  )
}