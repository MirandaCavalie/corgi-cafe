import { getUser, saveUser } from './hydradb.js'
import { getPersonalContext } from './thine.js'

const CAFFEINE_DRINKS = ['coffee', 'americano', 'latte', 'matcha', 'espresso']
const STRESS_KEYWORDS = ['deadline', 'presentation', 'interview', 'meeting', 'deploy', 'launch', 'need to', 'should', 'tomorrow', 'bug', 'broken', 'failing', 'crash']

const FULL_MENU = [
  { name: 'Classic Drip Coffee',  type: 'coffee',   caffeine: 'high',   energy: 'high',   vibes: ['focused', 'grinding', 'rough-morning', 'stressed', 'monday'], temp: 'hot' },
  { name: 'Iced Americano',       type: 'coffee',   caffeine: 'high',   energy: 'high',   vibes: ['intense', 'debugging', 'deadline', 'early-morning'],          temp: 'cold' },
  { name: 'Oat Milk Latte',       type: 'coffee',   caffeine: 'medium', energy: 'medium', vibes: ['cozy', 'planning', 'casual', 'reflective', 'morning'],        temp: 'hot' },
  { name: 'Iced Oat Milk Latte',  type: 'coffee',   caffeine: 'medium', energy: 'medium', vibes: ['afternoon', 'social', 'creative'],                            temp: 'cold' },
  { name: 'Iced Matcha Latte',    type: 'matcha',   caffeine: 'medium', energy: 'medium', vibes: ['calm-focus', 'deep-work', 'architecture', 'reading', 'portfolio'], temp: 'cold' },
  { name: 'Hot Matcha',           type: 'matcha',   caffeine: 'medium', energy: 'medium', vibes: ['zen', 'morning-calm', 'reflective', 'writing'],               temp: 'hot' },
  { name: 'Berry Smoothie',       type: 'smoothie', caffeine: 'none',   energy: 'low',    vibes: ['refreshed', 'break', 'relaxed', 'celebrating', 'friday'],     temp: 'cold' },
  { name: 'Mango Smoothie',       type: 'smoothie', caffeine: 'none',   energy: 'low',    vibes: ['tropical-break', 'creative', 'light', 'casual'],              temp: 'cold' },
  { name: 'Protein Smoothie',     type: 'smoothie', caffeine: 'none',   energy: 'medium', vibes: ['recovery', 'post-grind', 'lunch-skip', 'energized'],          temp: 'cold' },
]

// Normalize user profile across both old and new memory schemas
function normalizeProfile(user) {
  return {
    episodic: user.episodic ?? user.visitHistory ?? [],
    semantic: user.semantic ?? null,
    procedural: user.procedural ?? null,
    prospective: user.prospective ?? null,
    preferences: user.preferences ?? null,
    personalContext: user.personalContext ?? null,
    name: user.semantic?.name ?? user.name ?? 'Friend',
  }
}

// Tool 1: Retrieve semantic memory (facts, preferences, patterns)
export async function retrieveSemanticMemory(userId) {
  const user = await getUser(userId)
  const p = normalizeProfile(user)

  // New schema path
  if (p.semantic) {
    return {
      name: p.semantic.name ?? 'Friend',
      preferences: {
        explicit:    p.semantic.drinkPreferences?.explicit    ?? [],
        inferred:    p.semantic.drinkPreferences?.inferred    ?? [],
        byTimeOfDay: p.semantic.drinkPreferences?.byTimeOfDay ?? {},
        byMood:      p.semantic.drinkPreferences?.byMood      ?? {},
      },
      workPatterns:    p.semantic.workContext?.workStyle ? [p.semantic.workContext.workStyle] : [],
      moodTriggers:    p.semantic.moodPatterns ?? [],
      personalFacts:   p.semantic.personalFacts ?? [],
      proceduralRules: p.procedural?.rules ?? [],
      currentProjects: p.semantic.workContext?.currentProjects ?? [],
      recurringThemes: p.semantic.workContext?.recurringThemes ?? [],
    }
  }

  // Old schema fallback
  return {
    name: p.name,
    preferences: {
      explicit:    p.preferences?.allergies?.map(a => `avoids: ${a}`) ?? [],
      inferred:    p.preferences?.favoriteDrinks?.map(d => `prefers: ${d}`) ?? [],
      byTimeOfDay: p.preferences?.timePatterns ?? {},
      byMood:      {},
    },
    workPatterns:    [],
    moodTriggers:    [],
    personalFacts:   [],
    proceduralRules: [],
    currentProjects: p.personalContext?.currentProjects ?? [],
    recurringThemes: [],
  }
}

// Tool 2: Analyze document and structure for cross-referencing (no LLM call)
export async function analyzeAndCrossReference(document, fullEpisodicHistory) {
  const episodicStr = JSON.stringify(fullEpisodicHistory)
  return {
    documentLength:        document.length,
    tokenEstimate:         Math.round(document.length / 4),
    episodicTokenEstimate: Math.round(episodicStr.length / 4),
    crossReferenceReady:   true,
  }
}

// Tool 3: Compute energy context from local data
export async function getEnergyContext(userId) {
  const user  = await getUser(userId)
  const p     = normalizeProfile(user)
  const now   = new Date()
  const hour  = now.getHours()
  const today = now.toDateString()

  // Count caffeinated drinks had today
  const caffeineToday = p.episodic.filter(v => {
    if (!v.drinkOrdered) return false
    const drinkDate = new Date(v.timestamp).toDateString()
    if (drinkDate !== today) return false
    const lower = v.drinkOrdered.toLowerCase()
    return CAFFEINE_DRINKS.some(c => lower.includes(c))
  }).length

  // Energy level by time band
  let typicalEnergy
  if (hour >= 6  && hour < 10) typicalEnergy = 'high'
  else if (hour >= 10 && hour < 12) typicalEnergy = 'medium-high'
  else if (hour >= 12 && hour < 14) typicalEnergy = 'medium'
  else if (hour >= 14 && hour < 17) typicalEnergy = 'low'
  else typicalEnergy = 'low'

  // Crash prediction
  let predictedCrashTime = null
  if (caffeineToday >= 2 && hour < 15) {
    predictedCrashTime = `~${hour + 2}:30pm`
  }

  // Most common historical drink at this hour (±1)
  const historicalDrinksAtHour = p.episodic
    .filter(v => {
      const h = new Date(v.timestamp).getHours()
      return Math.abs(h - hour) <= 1 && v.drinkOrdered
    })
    .map(v => v.drinkOrdered)

  let historicalPatternAtThisTime = null
  if (historicalDrinksAtHour.length > 0) {
    const freq = {}
    historicalDrinksAtHour.forEach(d => { freq[d] = (freq[d] ?? 0) + 1 })
    historicalPatternAtThisTime = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
  }

  // Days since last visit
  const lastVisit = p.episodic.length > 0
    ? p.episodic[p.episodic.length - 1].timestamp
    : null
  const daysSince = lastVisit
    ? Math.round((Date.now() - new Date(lastVisit).getTime()) / 86400000)
    : null

  return {
    currentHour:              hour,
    dayOfWeek:                now.toLocaleDateString('en', { weekday: 'long' }),
    typicalEnergyAtThisHour:  typicalEnergy,
    caffeineToday,
    predictedCrashTime,
    historicalPatternAtThisTime,
    daysSinceLastVisit:       daysSince,
    recommendation: historicalPatternAtThisTime
      ? `Based on your history, you usually have ${historicalPatternAtThisTime} around this time.`
      : null,
  }
}

// Tool 4: Surface forgotten / unresolved context from visit history
export async function surfaceForgottenContext(userId) {
  const user = await getUser(userId)
  const p    = normalizeProfile(user)
  const all  = p.episodic

  // Also read prospective items from new schema
  const prospectiveItems = (p.prospective?.items ?? []).map(i => i.content)

  // Scan all logs for stress/future-intent keywords
  const flagged = []
  for (const visit of all) {
    const text = [visit.conversationSummary, visit.conversationLog, visit.workContext]
      .filter(Boolean).join(' ').toLowerCase()
    for (const kw of STRESS_KEYWORDS) {
      if (text.includes(kw)) {
        const snippet = visit.conversationSummary ?? visit.workContext ?? 'something mentioned'
        if (!flagged.includes(snippet)) flagged.push(snippet)
        break
      }
    }
  }

  // Unresolved = things from older visits not mentioned in most recent 1-2
  const recentText = all.slice(-2).map(v =>
    [v.conversationSummary, v.workContext, v.conversationLog].filter(Boolean).join(' ').toLowerCase()
  ).join(' ')

  const unresolvedItems = [
    ...prospectiveItems,
    ...flagged.filter(f => !recentText.includes(f.slice(0, 30).toLowerCase())),
  ].slice(0, 4)

  // Callback opportunities from last 1-3 visits
  const callbackOpportunities = all.slice(-3)
    .map(v => v.conversationSummary ?? v.workContext)
    .filter(Boolean)
    .slice(0, 3)

  // Emotional continuity
  const recentMoods = all.slice(-5).map(v => v.mood).filter(Boolean)
  const stressCount = recentMoods.filter(m => ['stressed', 'anxious', 'rough', 'tired'].includes(m)).length
  let emotionalContinuity = null
  if (stressCount >= 3) emotionalContinuity = `You've been stressed or anxious in ${stressCount} of your last 5 visits.`
  else if (recentMoods.filter(m => ['excited', 'happy', 'good', 'celebratory'].includes(m)).length >= 3) {
    emotionalContinuity = "You've been in a great mood lately — keep it up!"
  }

  const lastVisit = all.length > 0 ? all[all.length - 1].timestamp : null
  const daysSince = lastVisit
    ? Math.round((Date.now() - new Date(lastVisit).getTime()) / 86400000)
    : null

  return { unresolvedItems, callbackOpportunities, emotionalContinuity, daysSinceLastVisit: daysSince }
}

// Tool 5: Thine API wrapper (or mock)
export async function searchThineContext(query, userId) {
  const result = await getPersonalContext(userId)
  return {
    ...result,
    available: !!process.env.THINE_API_KEY,
  }
}

// Tool 6: Rule-based drink recommendation
export async function evaluateDrinkFit(userId, energyContext, currentMood = 'neutral', documentVibe = null) {
  const semantic = await retrieveSemanticMemory(userId)
  const rules    = semantic.proceduralRules ?? []
  const prefs    = semantic.preferences

  // Build a "vibe bag" from mood + documentVibe + time of day
  const vibeBag = new Set([
    currentMood?.toLowerCase().replace(/\s+/g, '-'),
    documentVibe?.toLowerCase(),
    energyContext?.typicalEnergyAtThisHour === 'low' ? 'relaxed' : 'focused',
    energyContext?.dayOfWeek === 'Friday' ? 'friday' : null,
  ].filter(Boolean))

  // Score each drink
  const scored = FULL_MENU.map(drink => {
    let score = 0

    // Vibe match
    for (const v of drink.vibes) {
      if (vibeBag.has(v)) score += 2
    }

    // Energy level match
    const energyLevel = energyContext?.typicalEnergyAtThisHour ?? 'medium'
    if (drink.energy === 'high'   && ['high', 'medium-high'].includes(energyLevel)) score++
    if (drink.energy === 'medium' && ['medium', 'medium-high'].includes(energyLevel)) score++
    if (drink.energy === 'low'    && ['low'].includes(energyLevel)) score++

    // Time-of-day temp fit
    const hour = energyContext?.currentHour ?? 12
    if (hour < 12 && drink.temp === 'hot')  score++
    if (hour >= 14 && drink.temp === 'cold') score++

    // Caffeine penalty
    const caffeineToday = energyContext?.caffeineToday ?? 0
    if (caffeineToday >= 3 && drink.type === 'coffee') score -= 3

    // Preference boost
    if (prefs?.inferred?.some(p => p.toLowerCase().includes(drink.name.toLowerCase()))) score += 2
    if (prefs?.byTimeOfDay) {
      const timeKey = hour < 12 ? 'morning' : hour < 15 ? 'afternoon' : 'late-afternoon'
      if (prefs.byTimeOfDay[timeKey]?.includes(drink.name)) score += 2
    }

    // Procedural rule exclusion
    const excluded = rules.some(rule => {
      const r = rule.toLowerCase()
      return (r.includes('dairy') && ['Oat Milk Latte', 'Iced Oat Milk Latte'].includes(drink.name) && r.includes('never'))
        || (r.includes('coffee') && hour >= 14 && drink.type === 'coffee' && r.includes('after 2pm'))
    })
    if (excluded) score = -99

    return { ...drink, score }
  })
    .filter(d => d.score > -99)
    .sort((a, b) => b.score - a.score)

  const top   = scored[0]
  const alts  = scored.slice(1, 3)

  const contraindications = []
  if (energyContext?.caffeineToday >= 3) {
    contraindications.push(`You've had ${energyContext.caffeineToday} caffeinated drinks today — maybe switch to a smoothie?`)
  }
  if (energyContext?.predictedCrashTime) {
    contraindications.push(`Coffee now might cause a crash at ${energyContext.predictedCrashTime}`)
  }

  return {
    topRecommendation: {
      name:       top?.name ?? 'Iced Matcha Latte',
      confidence: Math.min(1, Math.max(0.5, (top?.score ?? 3) / 8)),
      reason:     `Energy: ${top?.energy ?? 'medium'}, vibe: ${top?.vibes?.[0] ?? 'focused'}`,
    },
    alternatives:      alts.map(d => ({ name: d.name, reason: `Good for ${d.vibes[0]}` })),
    contraindications,
  }
}

// Tool 7: Persist memory updates back to HydraDB
export async function updateMemory(userId, updates) {
  const user = await getUser(userId)
  const p    = normalizeProfile(user)

  // Append to episodic history
  if (!user.episodic) user.episodic = p.episodic
  user.episodic.push({
    timestamp:           new Date().toISOString(),
    visitNumber:         (user.episodic.length + 1),
    mood:                updates.mood ?? null,
    drinkOrdered:        updates.drinkOrdered ?? null,
    conversationSummary: updates.visitSummary ?? null,
    workContext:         updates.workContext ?? null,
  })

  // Merge new facts into semantic layer
  if (updates.newFacts?.length > 0 && user.semantic) {
    user.semantic.personalFacts = [
      ...(user.semantic.personalFacts ?? []),
      ...updates.newFacts,
    ]
  }

  // Add prospective items
  if (updates.newProspective?.length > 0) {
    if (!user.prospective) user.prospective = { items: [] }
    for (const content of updates.newProspective) {
      user.prospective.items.push({ trigger: 'next_visit', content, addedAt: new Date().toISOString() })
    }
  }

  // Resolve prospective items
  if (updates.resolvedProspective?.length > 0 && user.prospective?.items) {
    user.prospective.items = user.prospective.items.filter(item =>
      !updates.resolvedProspective.some(r => item.content.toLowerCase().includes(r.toLowerCase().slice(0, 20)))
    )
  }

  // Also update old-schema visitHistory for backward compat
  if (!user.visitHistory) user.visitHistory = []
  user.visitHistory.push({
    timestamp:           new Date().toISOString(),
    mood:                updates.mood ?? null,
    drinkOrdered:        updates.drinkOrdered ?? null,
    conversationSummary: updates.visitSummary ?? null,
  })

  await saveUser(userId, user)
}

export { FULL_MENU }
