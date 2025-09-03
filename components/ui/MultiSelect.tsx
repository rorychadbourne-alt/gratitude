'use client'

import { useState } from 'react'

interface Option {
  id: string
  name: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export default function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId))
    } else {
      onChange([...selected, optionId])
    }
  }

  const selectedOptions = options.filter(option => selected.includes(option.id))

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
      >
        <span className="text-sm">
          {selectedOptions.length === 0 
            ? (placeholder || 'Select circles...') 
            : `${selectedOptions.length} circle${selectedOptions.length === 1 ? '' : 's'} selected`
          }
        </span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No circles available. Create or join circles first.
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="mr-3 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{option.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
            >
              {option.name}
              <button
                type="button"
                onClick={() => toggleOption(option.id)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}