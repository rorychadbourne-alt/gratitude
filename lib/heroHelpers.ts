export function getTimeGreeting(): string {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 10) return "Good morning"
    if (hour >= 10 && hour < 12) return "Hope your morning is going well"
    if (hour >= 12 && hour < 17) return "Good afternoon"
    if (hour >= 17 && hour < 21) return "Good evening"
    return "Hope your day was wonderful"
  }
  
  export function getUserJourneyStage(profile: any): 'new' | 'establishing' | 'regular' | 'returning' {
    if (!profile?.created_at) return 'new'
    
    const createdDate = new Date(profile.created_at)
    const daysSinceJoined = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceJoined <= 7) return 'new'
    if (daysSinceJoined <= 30) return 'establishing'
    return 'regular'
  }
  
  export function getContextualMessage(stage: string, streakProgress: number): string {
    const hour = new Date().getHours()
    
    switch (stage) {
      case 'new':
        if (streakProgress === 0) {
          return "Ready to start building your gratitude habit?"
        }
        return `Building your habit one day at a time — you're doing great`
        
      case 'establishing':
        if (streakProgress >= 4) {
          return "Your consistency is paying off — keep this momentum going"
        }
        if (streakProgress >= 2) {
          return "You're developing a beautiful routine"
        }
        return "Every day of practice strengthens your gratitude muscle"
        
      case 'regular':
        if (streakProgress === 5) {
          return "Another perfect week — your dedication inspires others"
        }
        if (streakProgress >= 3) {
          return "Your gratitude practice continues to flourish"
        }
        return "Welcome back to your daily moment of reflection"
        
      default:
        if (hour >= 17) {
          return "Take a moment to reflect on today's gifts"
        }
        return "Today is a new opportunity to notice life's blessings"
    }
  }