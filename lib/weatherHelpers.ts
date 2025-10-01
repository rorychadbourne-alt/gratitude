export const MOOD_OPTIONS = [
    { score: 1, icon: '⛈️', label: 'Stormy', color: 'from-slate-400 to-slate-500' },
    { score: 2, icon: '🌧️', label: 'Rainy', color: 'from-blue-400 to-blue-500' },
    { score: 3, icon: '⛅', label: 'Balanced', color: 'from-amber-300 to-amber-400' },
    { score: 4, icon: '☀️', label: 'Sunny', color: 'from-yellow-400 to-orange-400' }
  ]
  
  export const getMoodByScore = (score: number) => {
    return MOOD_OPTIONS.find(m => m.score === score) || MOOD_OPTIONS[2]
  }