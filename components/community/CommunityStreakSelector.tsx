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
    <div className="mb-6">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {communities.map((community) => {
          const isSelected = selectedCommunityId === community.id
          
          return (
            <button
              key={community.id}
              onClick={() => onCommunitySelect(community.id)}
              className={`flex-shrink-0 text-center p-3 rounded-xl transition-all duration-200 hover:bg-white/50 ${
                isSelected ? 'bg-white/60 shadow-md' : ''
              }`}
            >
              {/* Community Streak Ring */}
              <div className="mb-3">
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
                <p className={`font-brand text-xs font-medium truncate w-20 mb-1 ${
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
    </div>
  )
}