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
    const visits = memory.visitHistory || []
    const favDrinks = memory.preferences?.favoriteDrinks || []
    const lastVisit = visits.length > 1
      ? new Date(visits[visits.length - 2]?.timestamp).toLocaleDateString()
      : null

    return {
      visitCount: visits.length,
      favoriteDrink: favDrinks[0] || null,
      moodTrend: memory.personalContext?.moodTrend || null,
      lastVisit,
    }
  }

  return { memory, loading, updateMemory, getMemoryStats }
}
