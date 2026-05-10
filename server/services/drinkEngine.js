import { ALL_DRINKS } from '../prompts/corgiPersona.js'

export function getMenuText() {
  return ALL_DRINKS.map(d =>
    `- ${d.name} (${d.type}, energy: ${d.energy}, vibe: ${(d.vibe ?? []).join('/')}, ${d.temp})`
  ).join('\n')
}

export function buildFullContext(userProfile, document = null) {
  const parts = []

  parts.push(`=== USER PROFILE ===`)
  parts.push(`Name: ${userProfile.name || 'Friend'}`)
  parts.push(`Total visits: ${(userProfile.visitHistory || []).length}`)

  if (userProfile.preferences) {
    const prefs = userProfile.preferences
    if (prefs.favoriteDrinks?.length) parts.push(`Favorite drinks: ${prefs.favoriteDrinks.join(', ')}`)
    if (prefs.caffeinePreference) parts.push(`Caffeine preference: ${prefs.caffeinePreference}`)
    if (prefs.allergies?.length) parts.push(`Allergies: ${prefs.allergies.join(', ')}`)
  }

  if (userProfile.personalContext) {
    const ctx = userProfile.personalContext
    if (ctx.currentProjects?.length) parts.push(`Current projects: ${ctx.currentProjects.join(', ')}`)
    if (ctx.pendingTasks?.length) parts.push(`Pending tasks: ${ctx.pendingTasks.join(', ')}`)
    if (ctx.moodTrend) parts.push(`Recent mood trend: ${ctx.moodTrend}`)
  }

  if (userProfile.visitHistory?.length > 0) {
    parts.push(`\n=== RECENT VISIT HISTORY (last 10) ===`)
    const recent = userProfile.visitHistory.slice(-10)
    for (const v of recent) {
      const date = new Date(v.timestamp).toLocaleDateString()
      const parts2 = [date]
      if (v.mood) parts2.push(`mood: ${v.mood}`)
      if (v.drinkOrdered) parts2.push(`drink: ${v.drinkOrdered}`)
      if (v.conversationSummary) parts2.push(`talked about: ${v.conversationSummary}`)
      parts.push(`• ${parts2.join(' | ')}`)
    }
  }

  parts.push(`\n=== AVAILABLE DRINKS ===`)
  parts.push(getMenuText())

  parts.push(`\n=== CURRENT TIME ===`)
  const now = new Date()
  parts.push(`${now.toLocaleTimeString()} on ${now.toLocaleDateString()}`)

  if (document) {
    const preview = document.content.slice(0, 8000)
    const truncated = document.content.length > 8000 ? '\n[... document truncated ...]' : ''
    parts.push(`\n=== UPLOADED DOCUMENT: ${document.name} ===`)
    parts.push(preview + truncated)
  }

  return parts.join('\n')
}
