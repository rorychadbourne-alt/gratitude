'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import CreateCircle from '../community/CreateCircle'
import JoinCircle from '../community/JoinCircle'

interface OnboardingFlowProps {
  user: any
  onComplete: () => void
}

export default function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const totalSteps = 6

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    if (currentStep === 3) {
      // Skip gratitude entry
      setCurrentStep(4)
    } else if (currentStep === 4) {
      // Skip joining community
      setCurrentStep(5)
    } else if (currentStep === 5) {
      // Skip creating community
      setCurrentStep(6)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
      
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Gratitude Circle
              </h1>
              <p className="text-xl text-gray-600">
                Start your daily gratitude journey and connect with others
              </p>
            </div>
            <div className="mb-8">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🙏</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
            >
              Start Your Journey
            </button>
          </div>
        )

      case 2:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Power of Gratitude
            </h2>
            <div className="max-w-2xl mx-auto text-left space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Daily Practice</h3>
                <p className="text-blue-800">Regular gratitude practice has been shown to improve mental health, relationships, and overall well-being.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Community Connection</h3>
                <p className="text-green-800">Sharing gratitude with others amplifies its positive effects and builds stronger relationships.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Personal Growth</h3>
                <p className="text-purple-800">Track your journey and see how gratitude transforms your perspective over time.</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        )

      case 3:
        return (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Your First Gratitude Entry
              </h2>
              <p className="text-gray-600">
                Let&apos;s start with a special prompt to begin your journey
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <OnboardingGratitudePrompt user={user} onSubmit={handleNext} />
            </div>
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Join a Community
              </h2>
              <p className="text-gray-600">
                Enter an invite code to join a gratitude circle
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <JoinCircle user={user} onCircleJoined={handleNext} />
            </div>
            <div className="text-center mt-4 space-x-4">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Create Community Instead
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Community
              </h2>
              <p className="text-gray-600">
                Start your own gratitude circle and invite others
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <CreateCircle user={user} onCircleCreated={handleNext} />
            </div>
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                You&apos;re All Set!
              </h2>
              <p className="text-xl text-gray-600 max-w-md mx-auto">
                Your gratitude journey begins now. Remember, consistency is key to building a meaningful practice.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Getting Started...' : 'Get Started'}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-center mb-2">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Special onboarding gratitude component
function OnboardingGratitudePrompt({ user, onSubmit }: { user: any, onSubmit: () => void }) {
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim()) return

    console.log('Starting onboarding gratitude submission...')
    setSubmitting(true)
    try {
      // Get today's prompt instead of creating a special one
      console.log('Getting today\'s prompt...')
      const { data: todayPrompt, error: promptError } = await supabase
        .from('gratitude_prompts')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      console.log('Today\'s prompt result:', { todayPrompt, promptError })

      let prompt = todayPrompt
      
      // If no prompt for today, get any available prompt as fallback
      if (promptError || !prompt) {
        console.log('No today prompt, getting any available prompt...')
        const { data: anyPrompt, error: anyError } = await supabase
          .from('gratitude_prompts')
          .select('*')
          .limit(1)
          .single()
        
        console.log('Fallback prompt result:', { anyPrompt, anyError })
        if (anyError || !anyPrompt) {
          throw new Error('No prompts available')
        }
        prompt = anyPrompt
      }

      // Create the response with the custom onboarding text but using an existing prompt
      console.log('Creating gratitude response...')
      const { data: responseData, error: responseError } = await supabase
        .from('gratitude_responses')
        .insert({
          user_id: user.id,
          prompt_id: prompt.id,
          response_text: `I am grateful I started this daily practice because ${response.trim()}`
        })
        .select()

      console.log('Response result:', { responseData, responseError })
      if (responseError) throw responseError

      console.log('Success! Setting submitted state...')
      setSubmitted(true)
      
      setTimeout(() => {
        console.log('Auto-advancing to next step...')
        onSubmit()
      }, 1500)
      
    } catch (error) {
      console.error('Error submitting onboarding response:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Beautiful! Your first gratitude has been saved.
        </h3>
        <p className="text-green-700 text-sm">
          You've taken the first step in your gratitude journey.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        I am grateful I started this daily practice because...
      </h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Share why you&apos;re grateful for starting this journey..."
          rows={4}
          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
        
        <button
          type="submit"
          disabled={submitting || !response.trim()}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {submitting ? 'Sharing...' : 'Share My First Gratitude'}
        </button>
      </form>
    </div>
  )
}