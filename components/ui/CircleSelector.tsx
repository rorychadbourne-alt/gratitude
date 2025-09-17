'use client'
import { useState, useEffect } from 'react';

interface Circle {
  id: string;
  name: string;
  memberCount: number;
  streak: number;
  sharedToday: number;
  color: 'orange' | 'blue' | 'purple' | 'green' | 'pink';
}

interface CircleSelectorProps {
  userCircles?: Circle[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onCreateCircle?: () => void;
}

const CircleSelector = ({ 
  userCircles = [], 
  onSelectionChange,
  onCreateCircle 
}: CircleSelectorProps) => {
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);

  // Set initial selection when circles load - select all by default
  useEffect(() => {
    if (userCircles.length > 0) {
      const allCircleIds = userCircles.map(c => c.id);
      setSelectedCircles(allCircleIds);
      onSelectionChange?.(allCircleIds);
    }
  }, [userCircles, onSelectionChange]);

  const toggleCircle = (circleId: string) => {
    const newSelection = selectedCircles.includes(circleId) 
      ? selectedCircles.filter(id => id !== circleId)
      : [...selectedCircles, circleId];
    
    setSelectedCircles(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getColorClasses = (color: string, selected: boolean) => {
    const colors: Record<string, string> = {
      orange: selected 
        ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' 
        : 'bg-gray-50 border-gray-200 opacity-60',
      blue: selected 
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300' 
        : 'bg-gray-50 border-gray-200 opacity-60',
      purple: selected 
        ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300' 
        : 'bg-gray-50 border-gray-200 opacity-60',
      green: selected 
        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' 
        : 'bg-gray-50 border-gray-200 opacity-60',
      pink: selected 
        ? 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-300' 
        : 'bg-gray-50 border-gray-200 opacity-60'
    };
    return colors[color] || colors.blue;
  };

  const getCheckmarkClasses = (color: string, selected: boolean) => {
    const colors: Record<string, string> = {
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      pink: 'bg-pink-500'
    };
    return selected ? colors[color] || colors.blue : 'border-2 border-gray-300 bg-transparent';
  };

  const totalMembers = userCircles
    .filter(circle => selectedCircles.includes(circle.id))
    .reduce((sum, circle) => sum + circle.memberCount, 0);

  const selectedCircleNames = userCircles
    .filter(circle => selectedCircles.includes(circle.id))
    .map(circle => circle.name)
    .join(' and ');

  // No circles state
  if (userCircles.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-800 mb-2">Join your first circle</h3>
          <p className="text-sm text-gray-600">Gratitude is better when shared with others</p>
        </div>

        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.12M17 20v-2a3 3 0 00-5.196-2.12M17 20H7m10 0v-2c0-1.654-1.348-3-3-3H7m10-3V9a4 4 0 10-8 0v6.5M7 20v-2a3 3 0 015.196-2.12M7 20H2v-2a3 3 0 015.196-2.12"/>
            </svg>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Create Your First Circle</h4>
          <p className="text-sm text-gray-600 mb-6 max-w-sm">
            Start a gratitude circle with family, friends, or colleagues. Share meaningful moments and build deeper connections.
          </p>
          
          <button 
            onClick={onCreateCircle}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
          >
            Create Circle
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Or ask a friend to invite you to their circle
          </p>
        </div>

        {/* Keep private option */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium text-gray-800">
              Keep this gratitude private for now
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">You can always share it with circles later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-800 mb-2">Share with your circles</h3>
        <p className="text-sm text-gray-600">Select which communities will see your gratitude</p>
      </div>

      {/* Circle Cards Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {userCircles.map((circle) => {
          const isSelected = selectedCircles.includes(circle.id);
          
          return (
            <div
              key={circle.id}
              onClick={() => toggleCircle(circle.id)}
              className={`flex-shrink-0 w-36 h-36 border-2 rounded-full p-4 cursor-pointer transition-all hover:shadow-lg ${getColorClasses(circle.color, isSelected)} flex flex-col items-center justify-center relative`}
            >
              {/* Selection checkmark - positioned at top right */}
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getCheckmarkClasses(circle.color, isSelected)}`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              
              <h4 className={`font-semibold text-center mb-2 ${isSelected ? 'text-gray-800' : 'text-gray-600'} text-sm leading-tight`}>
                {circle.name}
              </h4>
              
              <div className={`flex items-center gap-1 text-xs mb-1 ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                <span>🔥</span>
                <span>{circle.streak} day streak</span>
              </div>
              
              <div className={`text-xs font-medium ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
                {circle.sharedToday} shared today
              </div>
            </div>
          );
        })}

        {/* Create New Circle Card */}
        <div 
          onClick={onCreateCircle}
          className="flex-shrink-0 w-36 h-36 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full cursor-pointer transition-all hover:shadow-lg hover:border-gray-400 flex flex-col items-center justify-center"
        >
          <div className="text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span className="text-xs font-medium">Create Circle</span>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCircles.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium text-green-800">
              Sharing with {selectedCircleNames} ({totalMembers} people)
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">Your gratitude will inspire your communities</p>
        </div>
      )}

      {selectedCircles.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium text-yellow-800">
              Select circles to share your gratitude
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Gratitude grows when shared with others</p>
        </div> 
      )}
    </div>
  );
};

export default CircleSelector;