import { supabase } from './supabase'

// Get the start of the current week (Sunday)
export function getWeekStart(date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// Get day of week as number (0=Sunday, 1=Monday, etc.)
export function getDayOfWeek(date = new Date()): number {
  return date.getDay()
}

// Format date for database storage
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get or create weekly streak record
export async function getOrCreateWeeklyStreak(userId: string, weekStart: Date) {
  const weekStartStr = formatDate(weekStart)
  
  // Try to get existing record
  const { data: existing, error: fetchError } = await supabase
    .from('weekly_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartStr)
    .single()

  if (existing) {
    return { data: existing, error: null }
  }

  // Create new record if doesn't exist
  const { data: newRecord, error: createError } = await supabase
    .from('weekly_streaks')
    .insert({
      user_id: userId,
      week_start_date: weekStartStr,
      completed_days: [],
      rings_completed: 0
    })
    .select()
    .single()

  return { data: newRecord, error: createError }
}

// Update streak when user completes gratitude
export async function updateWeeklyStreak(userId: string, completionDate = new Date()) {
  const weekStart = getWeekStart(completionDate)
  const dayOfWeek = getDayOfWeek(completionDate)

  // Get or create streak record
  const { data: streak, error: getError } = await getOrCreateWeeklyStreak(userId, weekStart)
  if (getError || !streak) {
    console.error('Error getting weekly streak:', getError)
    return { data: null, error: getError }
  }

  // Check if this day is already recorded
  if (streak.completed_days.includes(dayOfWeek)) {
    return { data: streak, error: null } // Already completed today
  }

  // Add today to completed days
  const newCompletedDays = [...streak.completed_days, dayOfWeek].sort()
  const newRingsCompleted = Math.min(newCompletedDays.length, 5)

  // Update record
  const { data: updated, error: updateError } = await supabase
    .from('weekly_streaks')
    .update({
      completed_days: newCompletedDays,
      rings_completed: newRingsCompleted,
      updated_at: new Date().toISOString()
    })
    .eq('id', streak.id)
    .select()
    .single()

  return { data: updated, error: updateError }
}

// Get current week's streak progress
export async function getCurrentWeekStreak(userId: string) {
  const weekStart = getWeekStart()
  const weekStartStr = formatDate(weekStart)

  const { data, error } = await supabase
    .from('weekly_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartStr)
    .single()

  // Return default if no record exists yet
  if (error || !data) {
    return {
      data: {
        completed_days: [],
        rings_completed: 0
      },
      error: null
    }
  }

  return { data, error: null }
}