'use client'

interface Community {
  id: string
  name: string
  ringsCompleted: number
  todayActive: number
  totalMembers: number
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
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {communities.map((community) => {
          const isSelected = selectedCommunityId === community.id
          const participationRate = community.totalMembers > 0 ? 
            community.todayActive / community.totalMembers : 0
          
          return (
            <button
              key={community.id}
              onClick={() => onCommunitySelect(community.id)}
              className="flex-shrink-0 text-center p-3 rounded-xl transition-all duration-200 hover:bg-white/50"
            >
              {/* Streak Ring */}
              <div className="relative mb-2">
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-br from-periwinkle-400 to-periwinkle-500 shadow-lg scale-110' 
                      : 'bg-gradient-to-br from-periwinkle-200 to-periwinkle-300'
                  }`}
                >
                  {/* Simple ring representation */}
                  <div className="text-center">
                    <div className={`font-brand text-sm font-bold ${isSelected ? 'text-white' : 'text-periwinkle-700'}`}>
                      {community.ringsCompleted}/5
                    </div>
                    <div className={`font-brand text-xs ${isSelected ? 'text-periwinkle-100' : 'text-periwinkle-600'}`}>
                      days
                    </div>
                  </div>
                </div>
                
                {/* Active indicator */}
                {community.todayActive > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-brand font-bold text-white">
                      {community.todayActive}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Community Info */}
              <div className="text-center">
                <p className={`font-brand text-xs font-medium truncate w-20 ${
                  isSelected ? 'text-sage-800' : 'text-sage-600'
                }`}>
                  {community.name}
                </p>
                <p className="font-brand text-xs text-sage-500">
                  {community.totalMembers} members
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}