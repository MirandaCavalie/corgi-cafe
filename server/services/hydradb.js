/**
 * HydraDB adapter layer.
 * Uses local JSON file as fallback when HYDRADB_API_KEY is not set.
 * Swap in the real HydraDB SDK by implementing the same interface.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dir, '..', 'data')
const DB_FILE = join(DATA_DIR, 'memory.json')

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function readDB() {
  ensureDataDir()
  if (!existsSync(DB_FILE)) return {}
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function writeDB(data) {
  ensureDataDir()
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function defaultProfile(userId) {
  return {
    userId,
    name: 'Friend',
    visitHistory: [],
    preferences: {
      favoriteDrinks: [],
      allergies: [],
      caffeinePreference: 'medium',
      sweetness: 'medium',
      timePatterns: {},
    },
    personalContext: {
      currentProjects: [],
      recentMeetings: [],
      pendingTasks: [],
      moodTrend: 'neutral',
    },
    createdAt: new Date().toISOString(),
  }
}

export async function getUser(userId) {
  if (process.env.HYDRADB_API_KEY) {
    // TODO: swap in real HydraDB SDK call
    // return await hydradb.get(userId)
  }

  const db = readDB()
  return db[userId] || defaultProfile(userId)
}

export async function saveUser(userId, profile) {
  if (process.env.HYDRADB_API_KEY) {
    // TODO: swap in real HydraDB SDK call
    // return await hydradb.set(userId, profile)
  }

  const db = readDB()
  db[userId] = { ...profile, updatedAt: new Date().toISOString() }
  writeDB(db)
  return db[userId]
}

export async function updateUser(userId, updates) {
  const existing = await getUser(userId)
  const merged = deepMerge(existing, updates)
  return saveUser(userId, merged)
}

export async function addVisit(userId, visitData) {
  const user = await getUser(userId)
  user.visitHistory = [
    ...(user.visitHistory || []),
    { timestamp: new Date().toISOString(), ...visitData },
  ]
  // Keep last 100 visits
  if (user.visitHistory.length > 100) {
    user.visitHistory = user.visitHistory.slice(-100)
  }
  return saveUser(userId, user)
}

function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      // Merge arrays without duplicates for string arrays
      const merged = [...target[key]]
      for (const item of source[key]) {
        if (!merged.includes(item)) merged.push(item)
      }
      result[key] = merged.slice(0, 20)
    } else if (source[key] !== undefined) {
      result[key] = source[key]
    }
  }
  return result
}
