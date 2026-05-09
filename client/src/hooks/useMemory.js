import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const DEFAULT_USER_ID = 'demo-user'

export function useMemory(userId = DEFAULT_USER_ID) {
  const [memory, setMemory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMemory(userId)
      .then(data => setMemory(data))
      .catch(() => setMemory(null))
      .finally(() => setLoading(false))
  }, [userId])

  const updateMemory = async (updates) => {
    try {
      const updated = await api.updateMemory(userId, updates)
      setMemory(updated)
      return updated
    } catch {
      return null
    }
  }

  const getMemoryStats = () => {
    if (!memory) return null
    // Support both new schema (episodic) and old schema (visitHistory)
    const visits = memory.episodic ?? memory.visitHistory ?? []
    const favDrinks = memory.semantic?.drinkPreferences?.explicit
      ?? memory.preferences?.favoriteDrinks
      ?? []
    const lastVisit = visits.length > 1
      ? new Date(visits[visits.length - 2]?.timestamp).toLocaleDateString()
      : null
    const moodTrend = memory.semantic?.moodPatterns?.[0]
      ?? memory.personalContext?.moodTrend
      ?? null
    const favDrink = memory.semantic?.drinkPreferences?.inferred?.[0]?.replace('prefers: ', '')
      ?? favDrinks[0]
      ?? null

    return {
      visitCount: visits.length,
      favoriteDrink: favDrink,
      moodTrend,
      lastVisit,
    }
  }

  return { memory, loading, updateMemory, getMemoryStats }
}
