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
      setCurrentStep(4)
    } else if (currentStep === 4) {
      setCurrentStep(5)
    } else if (currentStep === 5) {
      setCurrentStep(6)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
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
            <div className="mb-12">
              <h1 className="font-display text-5xl font-semibold text-sage-800 mb-6 leading-tight">
                Welcome to Gratitude Circle
              </h1>
              <p className="font-brand text-xl text-sage-600 max-w-2xl mx-auto leading-relaxed">
                Start your daily gratitude journey and connect with others who believe in the power of appreciation
              </p>
            </div>
            <div className="mb-12">
              <div className="w-32 h-32 bg-gradient-to-br from-periwinkle-400 to-gold-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-5xl">🙏</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white px-12 py-4 rounded-xl text-lg font-brand font-medium hover:from-periwinkle-600 hover:to-periwinkle-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </button>
          </div>
        )

      case 2:
        return (
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold text-sage-800 mb-8">
              The Power of Gratitude
            </h2>
            <div className="max-w-3xl mx-auto text-left space-y-6 mb-12">
              <div className="bg-gradient-to-r from-periwinkle-50 to-warm-100 p-6 rounded-xl border border-periwinkle-100">
                <h3 className="font-brand font-semibold text-periwinkle-800 mb-3 text-lg">Daily Practice</h3>
                <p className="font-brand text-periwinkle-700 leading-relaxed">Regular gratitude practice has been shown to improve mental health, relationships, and overall well-being.</p>
              </div>
              <div className="bg-gradient-to-r from-gold-50 to-peach-100 p-6 rounded-xl border border-gold-200">
                <h3 className="font-brand font-semibold text-gold-800 mb-3 text-lg">Community Connection</h3>
                <p className="font-brand text-gold-700 leading-relaxed">Sharing gratitude with others amplifies its positive effects and builds stronger relationships.</p>
              </div>
              <div className="bg-gradient-to-r from-peach-50 to-warm-100 p-6 rounded-xl border border-peach-200">
                <h3 className="font-brand font-semibold text-peach-500 mb-3 text-lg">Personal Growth</h3>
                <p className="font-brand text-sage-700 leading-relaxed">Track your journey and see how gratitude transforms your perspective over time.</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white px-12 py-4 rounded-xl text-lg font-brand font-medium hover:from-periwinkle-600 hover:to-periwinkle-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Continue
            </button>
          </div>
        )

      case 3:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl font-semibold text-sage-800 mb-4">
                Your First Gratitude Entry
              </h2>
              <p className="font-brand text-sage-600 text-lg">
                Let&apos;s start with a special prompt to begin your journey
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <OnboardingGratitudePrompt user={user} onSubmit={handleNext} />
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleSkip}
                className="font-brand text-sage-500 hover:text-sage-700 text-sm underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl font-semibold text-sage-800 mb-4">
                Join a Community
              </h2>
              <p className="font-brand text-sage-600 text-lg">
                Enter an invite code to join a gratitude circle
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <JoinCircle user={user} onCircleJoined={handleNext} />
            </div>
            <div className="text-center mt-6 space-x-6">
              <button
                onClick={handleSkip}
                className="font-brand text-sage-500 hover:text-sage-700 text-sm underline"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="font-brand text-periwinkle-600 hover:text-periwinkle-800 text-sm underline"
              >
                Create Community Instead
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl font-semibold text-sage-800 mb-4">
                Create Your Community
              </h2>
              <p className="font-brand text-sage-600 text-lg">
                Start your own gratitude circle and invite others
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <CreateCircle user={user} onCircleCreated={handleNext} />
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleSkip}
                className="font-brand text-sage-500 hover:text-sage-700 text-sm underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center">
            <div className="mb-12">
              <div className="w-32 h-32 bg-gradient-to-br from-gold-400 to-peach-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-5xl">✨</span>
              </div>
              <h2 className="font-display text-4xl font-semibold text-sage-800 mb-6">
                You&apos;re All Set!
              </h2>
              <p className="font-brand text-xl text-sage-600 max-w-2xl mx-auto leading-relaxed">
                Your gratitude journey begins now. Remember, consistency is key to building a meaningful practice.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="bg-gradient-to-r from-gold-400 to-peach-400 text-white px-12 py-4 rounded-xl text-lg font-brand font-medium hover:from-gold-500 hover:to-peach-500 disabled:opacity-50 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Getting Started...' : 'Enter Your Gratitude Space'}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-morning-gradient z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex justify-center mb-4">
              <span className="font-brand text-sm text-sage-600 bg-white/80 px-4 py-2 rounded-full">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 max-w-md mx-auto backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-periwinkle-500 to-gold-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-12">
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
      console.log('Getting today\'s prompt...')
      const { data: todayPrompt, error: promptError } = await supabase
        .from('gratitude_prompts')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      console.log('Today\'s prompt result:', { todayPrompt, promptError })

      let prompt = todayPrompt
      
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

      console.log('Creating gratitude response...')
      const { data: responseData, error: responseError } = await supabase
        .from('gratitude_responses')
        .insert({
          user_id: user.id,
          prompt_id: prompt.id,
          response_text: `I am grateful I started this daily practice because ${response.trim()}`,
          is_onboarding_response: true
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
      <div className="bg-gradient-to-r from-gold-50 to-peach-100 rounded-xl p-8 text-center border border-gold-200">
        <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-peach-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="font-display text-xl font-semibold text-sage-800 mb-3">
          Beautiful! Your first gratitude has been saved.
        </h3>
        <p className="font-brand text-sage-600">
          You&apos;ve taken the first step in your gratitude journey.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-periwinkle-50 to-warm-100 rounded-xl p-8 border border-periwinkle-200">
      <h3 className="font-display text-xl font-semibold text-periwinkle-800 mb-6 text-center">
        I am grateful I started this daily practice because...
      </h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Share why you're grateful for starting this journey..."
          rows={4}
          className="w-full px-4 py-3 border border-periwinkle-200 rounded-xl focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent resize-none font-brand"
          required
        />
        
        <button
          type="submit"
          disabled={submitting || !response.trim()}
          className="mt-6 w-full bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-3 px-6 rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 font-brand font-medium transition-all duration-200"
        >
          {submitting ? 'Sharing...' : 'Share My First Gratitude'}
        </button>
      </form>
    </div>
  )
}