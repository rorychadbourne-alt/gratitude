// Helper functions for specific toast types

interface ToastHelpers {
    gratitudeShared: () => void
    displayNameUpdated: () => void
    circleCreated: (circleName: string) => void
    circleJoined: (circleName: string) => void
    weeklyStreakAchieved: (weekNumber: number) => void
    milestoneAchieved: (count: number) => void
  }
  
  export const createToastHelpers = (toast: any): ToastHelpers => ({
    gratitudeShared: () => {
      toast.showSuccess(
        'Gratitude Shared!',
        'Your daily reflection has been saved'
      )
    },
  
    displayNameUpdated: () => {
      toast.showSuccess(
        'Profile Updated',
        'Your display name has been changed'
      )
    },
  
    circleCreated: (circleName: string) => {
      toast.showSuccess(
        'Circle Created!',
        `"${circleName}" is ready for members`
      )
    },
  
    circleJoined: (circleName: string) => {
      toast.showSuccess(
        `Joined "${circleName}"!`,
        'Start sharing gratitude with your community'
      )
    },
  
    weeklyStreakAchieved: (weekNumber: number) => {
      toast.showCelebration(
        `${weekNumber} Week Streak!`,
        'Your consistency is building a beautiful habit',
        '🔥'
      )
    },
  
    milestoneAchieved: (count: number) => {
      const milestoneMessages = {
        10: { title: '10 Gratitudes Shared!', message: 'You\'re building momentum!', icon: '✨' },
        25: { title: '25 Gratitudes Shared!', message: 'Your appreciation practice is growing strong', icon: '🌟' },
        50: { title: '50 Gratitudes Shared!', message: 'Incredible dedication to daily gratitude', icon: '🎊' },
        100: { title: '100 Gratitudes Shared!', message: 'You\'re a gratitude champion! This is amazing!', icon: '👑' }
      }
  
      const milestone = milestoneMessages[count as keyof typeof milestoneMessages]
      if (milestone) {
        toast.showMilestone(milestone.title, milestone.message, milestone.icon)
      }
    }
  })