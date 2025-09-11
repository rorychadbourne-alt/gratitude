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
                Your Personal Commitment
              </h2>
              <p className="font-brand text-sage-600 text-lg">
                Create your personal gratitude pledge to strengthen your commitment
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
              <JoinCircle user={user} onClose={() => handleSkip()} onCircleJoined={handleNext} />
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
              <CreateCircle user={user} onClose={() => handleSkip()} onCircleCreated={handleNext} />
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

// Inline commitment prompt component
function OnboardingGratitudePrompt({ user, onSubmit }: { user: any, onSubmit: () => void }) {
  const [name, setName] = useState('')
  const [gratitudeResponse, setGratitudeResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !gratitudeResponse.trim()) return

    setSubmitting(true)
    try {
      // Save the display name to the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: name.trim() })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Get today's prompt or fallback
      const { data: todayPrompt, error: promptError } = await supabase
        .from('gratitude_prompts')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      let prompt = todayPrompt
      
      if (promptError || !prompt) {
        const { data: anyPrompt, error: anyError } = await supabase
          .from('gratitude_prompts')
          .select('*')
          .limit(1)
          .single()
        
        if (anyError || !anyPrompt) {
          throw new Error('No prompts available')
        }
        prompt = anyPrompt
      }

      // Save the complete statement
      const fullStatement = `I, ${name.trim()}, am grateful I started this daily practice because ${gratitudeResponse.trim()}`

      const { data: responseData, error: responseError } = await supabase
        .from('gratitude_responses')
        .insert({
          user_id: user.id,
          prompt_id: prompt.id,
          response_text: fullStatement,
          is_onboarding_response: true
        })
        .select()

      if (responseError) throw responseError

      setSubmitted(true)
      
      setTimeout(() => {
        onSubmit()
      }, 2000)
      
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
          Your commitment has been saved, {name}!
        </h3>
        <p className="font-brand text-sage-600">
          You&apos;ve made a personal pledge to your gratitude practice.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-periwinkle-50 to-warm-100 rounded-xl p-8 border border-periwinkle-200">
      <h3 className="font-display text-xl font-semibold text-periwinkle-800 mb-8 text-center">
        Create your personal gratitude commitment
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/60 rounded-lg p-6 border border-periwinkle-100">
          <div className="text-lg leading-relaxed font-brand text-periwinkle-800">
            <span className="mr-2">I,</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              className="inline-block min-w-0 w-auto px-2 py-1 border-b-2 border-periwinkle-300 bg-transparent focus:border-periwinkle-500 focus:outline-none font-medium text-periwinkle-900 placeholder-periwinkle-500"
              style={{ width: `${Math.max(name.length + 2, 10)}ch` }}
              required
              maxLength={50}
            />
            <span className="mx-2">, am grateful I started this daily practice because</span>
            <br />
            <textarea
              value={gratitudeResponse}
              onChange={(e) => setGratitudeResponse(e.target.value)}
              placeholder="I want to cultivate a more positive mindset and appreciate life's blessings..."
              className="mt-4 w-full min-h-[120px] px-3 py-2 border-2 border-periwinkle-200 rounded-lg bg-white/80 focus:border-periwinkle-500 focus:outline-none resize-none font-brand text-periwinkle-900 placeholder-periwinkle-500"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={submitting || !name.trim() || !gratitudeResponse.trim()}
          className="w-full bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white py-4 px-6 rounded-xl hover:from-periwinkle-600 hover:to-periwinkle-700 disabled:opacity-50 font-brand font-medium transition-all duration-200 text-lg"
        >
          {submitting ? 'Making Your Commitment...' : 'Make This My Commitment'}
        </button>
      </form>
    </div>
  )
}