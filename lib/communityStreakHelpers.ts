import { supabase } from './supabase'
import { getWeekStart, formatDate, getDayOfWeek } from './streakHelpers'

// Get or create community weekly streak record
export async function getOrCreateCommunityStreak(circleId: string, weekStart: Date) {
  const weekStartStr = formatDate(weekStart)
  
  // Try to get existing record
  const { data: existing, error: fetchError } = await supabase
    .from('community_streaks')
    .select('*')
    .eq('circle_id', circleId)
    .eq('week_start_date', weekStartStr)
    .single()

  if (existing) {
    return { data: existing, error: null }
  }

  // Create new record if doesn't exist
  const { data: newRecord, error: createError } = await supabase
    .from('community_streaks')
    .insert({
      circle_id: circleId,
      week_start_date: weekStartStr,
      completed_days: [],
      rings_completed: 0,
      participation_threshold: 1.0 // 100% of members need to participate
    })
    .select()
    .single()

  return { data: newRecord, error: createError }
}

// Calculate community participation for a specific day
export async function calculateCommunityParticipation(circleId: string, date = new Date()) {
  const dateStr = formatDate(date)
  
  // Get all circle members
  const { data: members } = await supabase
    .from('circle_members')
    .select('user_id')
    .eq('circle_id', circleId)

  const memberIds = members?.map(m => m.user_id) || []
  const totalMembers = memberIds.length

  if (totalMembers === 0) {
    return { activeMembers: 0, totalMembers: 0, participationRate: 0 }
  }

  // Get gratitude responses from circle members for this date
  const { data: responses } = await supabase
    .from('gratitude_responses')
    .select('user_id')
    .eq('created_at::date', dateStr)
    .eq('is_onboarding_response', false)
    .in('user_id', memberIds)

  const activeMembers = new Set(responses?.map(r => r.user_id) || []).size
  const participationRate = activeMembers / totalMembers

  return { activeMembers, totalMembers, participationRate }
}

// Update community streak based on daily participation
export async function updateCommunityStreak(circleId: string, date = new Date()) {
  const weekStart = getWeekStart(date)
  const dayOfWeek = getDayOfWeek(date)

  // Get or create streak record
  const { data: streak, error: getError } = await getOrCreateCommunityStreak(circleId, weekStart)
  if (getError || !streak) {
    return { data: null, error: getError }
  }

  // Check if this day is already recorded
  if (streak.completed_days.includes(dayOfWeek)) {
    return { data: streak, error: null }
  }

  // Calculate today's participation
  const { activeMembers, totalMembers } = await calculateCommunityParticipation(circleId, date)
  
  // Check if ALL community members participated (100% participation)
  if (activeMembers === totalMembers && totalMembers > 0) {
    // Add today to completed days
    const newCompletedDays = [...streak.completed_days, dayOfWeek].sort()
    const newRingsCompleted = Math.min(newCompletedDays.length, 5)

    // Update record
    const { data: updated, error: updateError } = await supabase
      .from('community_streaks')
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

  return { data: streak, error: null }
}

// Get current week's community streak
export async function getCurrentCommunityStreak(circleId: string) {
  const weekStart = getWeekStart()
  const weekStartStr = formatDate(weekStart)

  const { data, error } = await supabase
    .from('community_streaks')
    .select('*')
    .eq('circle_id', circleId)
    .eq('week_start_date', weekStartStr)
    .single()

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