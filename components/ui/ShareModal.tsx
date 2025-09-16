'use client'
import { useState, useEffect } from 'react'

interface Circle {
  id: string;
  name: string;
  memberCount: number;
  streak: number;
  sharedToday: number;
  color: 'orange' | 'blue' | 'purple' | 'green' | 'pink';
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (selectedCircleIds: string[], responseText: string) => void;
  responseText: string;
  userCircles: Circle[];
  onCreateCircle?: () => void;
  isSubmitting?: boolean;
}

const ShareModal = ({
  isOpen,
  onClose,
  onShare,
  responseText,
  userCircles,
  onCreateCircle,
  isSubmitting = false
}: ShareModalProps) => {
  const [selectedCircles, setSelectedCircles] = useState<string[]>([])

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCircles(userCircles.map(c => c.id)) // Select all by default
    }
  }, [isOpen, userCircles])

  const toggleCircle = (circleId: string) => {
    setSelectedCircles(prev => 
      prev.includes(circleId) 
        ? prev.filter(id => id !== circleId)
        : [...prev, circleId]
    )
  }

  const handleShare = () => {
    onShare(selectedCircles, responseText)
  }

  const handleCreateCircle = () => {
    onClose()
    // Navigate to communities page with create modal
    window.location.href = '/communities?create=true'
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'from-orange-50 to-orange-100 border-orange-300',
      blue: 'from-blue-50 to-blue-100 border-blue-300',
      purple: 'from-purple-50 to-purple-100 border-purple-300',
      green: 'from-green-50 to-green-100 border-green-300',
      pink: 'from-pink-50 to-pink-100 border-pink-300'
    }
    return colors[color] || colors.blue
  }

  const getCheckmarkColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      pink: 'bg-pink-500'
    }
    return colors[color] || colors.blue
  }

  const totalMembers = userCircles
    .filter(circle => selectedCircles.includes(circle.id))
    .reduce((sum, circle) => sum + circle.memberCount, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Share Gratitude</h2>
            <button
              onClick={handleShare}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sharing...</span>
                </div>
              ) : (
                'Share'
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your gratitude:</p>
              <p className="text-gray-800 leading-relaxed">
                {responseText.length > 100 
                  ? `${responseText.substring(0, 100)}...` 
                  : responseText
                }
              </p>
            </div>

            {userCircles.length === 0 ? (
              /* No circles state */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.12M17 20v-2a3 3 0 00-5.196-2.12M17 20H7m10 0v-2c0-1.654-1.348-3-3-3H7m10-3V9a4 4 0 10-8 0v6.5M7 20v-2a3 3 0 015.196-2.12M7 20H2v-2a3 3 0 515.196-2.12"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Create Your First Circle</h3>
                <p className="text-sm text-gray-600 mb-4">Start sharing gratitude with family, friends, or colleagues</p>
                <button
                  onClick={handleCreateCircle}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Circle
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-medium text-gray-800 mb-4">Choose circles to share with</h3>
                
                {/* Circles List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {userCircles.map((circle) => {
                    const isSelected = selectedCircles.includes(circle.id)
                    
                    return (
                      <div
                        key={circle.id}
                        onClick={() => toggleCircle(circle.id)}
                        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? `bg-gradient-to-r ${getColorClasses(circle.color)} border-current` 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Circle Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                          isSelected ? getCheckmarkColor(circle.color) : 'bg-gray-400'
                        }`}>
                          {isSelected ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          ) : (
                            <span>{circle.name.charAt(0)}</span>
                          )}
                        </div>

                        {/* Circle Info */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{circle.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{circle.memberCount} members</span>
                            <span>🔥 {circle.streak} day streak</span>
                            <span className="text-green-600">{circle.sharedToday} shared today</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Create Circle Option */}
                <button
                  onClick={handleCreateCircle}
                  className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Create New Circle
                </button>

                {/* Selection Summary */}
                {selectedCircles.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        Sharing with {selectedCircles.length} circle{selectedCircles.length !== 1 ? 's' : ''} ({totalMembers} people)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ShareModal