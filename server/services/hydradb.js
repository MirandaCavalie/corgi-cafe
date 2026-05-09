/**
 * Memory adapter layer.
 * Priority:
 * 1. HydraDB API when HYDRADB_API_KEY is set.
 * 2. Render Postgres when DATABASE_URL is set.
 * 3. Local memory.json for development.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dir, '..', 'data')
const DB_FILE = join(DATA_DIR, 'memory.json')
const HYDRADB_DEFAULT_API_URL = 'https://api.hydradb.com'
const HYDRADB_DEFAULT_TENANT_ID = 'corgi-cafe'
const HYDRADB_PROFILE_TITLE_PREFIX = 'Corgi Cafe profile'

export function getActiveStorageLayer() {
  if (process.env.HYDRADB_API_KEY) {
    return { id: 'hydradb', label: 'HydraDB' }
  }

  if (process.env.DATABASE_URL) {
    return { id: 'postgres', label: 'Postgres' }
  }

  return { id: 'memory-json', label: 'memory.json' }
}

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
  const storage = getActiveStorageLayer()

  if (storage.id === 'hydradb') {
    return await getHydraUser(userId)
  }

  if (storage.id === 'postgres') {
    const { getUserFromPostgres } = await import('./database.js')
    return (await getUserFromPostgres(userId)) || defaultProfile(userId)
  }

  const db = readDB()
  return db[userId] || defaultProfile(userId)
}

export async function saveUser(userId, profile) {
  const storage = getActiveStorageLayer()
  const nextProfile = { ...profile, updatedAt: new Date().toISOString() }

  if (storage.id === 'hydradb') {
    await saveHydraUser(userId, nextProfile)
    return nextProfile
  }

  if (storage.id === 'postgres') {
    const { saveUserToPostgres } = await import('./database.js')
    return await saveUserToPostgres(userId, nextProfile)
  }

  const db = readDB()
  db[userId] = nextProfile
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

async function getHydraUser(userId) {
  const response = await hydraRequest('/list/data', {
    tenant_id: hydraTenantId(),
    sub_tenant_id: userId,
    kind: 'memories',
    page: 1,
    page_size: 100,
  })

  const profile = extractHydraProfile(listHydraItems(response), userId)
  return profile || defaultProfile(userId)
}

async function saveHydraUser(userId, profile) {
  await hydraRequest('/memories/add_memory', {
    tenant_id: hydraTenantId(),
    sub_tenant_id: userId,
    upsert: true,
    memories: [
      {
        title: hydraProfileTitle(userId),
        text: serializeHydraProfile(profile),
        is_markdown: true,
        infer: false,
      },
    ],
  })
}

async function hydraRequest(path, body) {
  const response = await fetch(`${hydraApiUrl()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HYDRADB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HydraDB ${path} failed (${response.status}): ${text}`)
  }

  return await response.json()
}

function hydraApiUrl() {
  return (process.env.HYDRADB_API_URL || HYDRADB_DEFAULT_API_URL).replace(/\/$/, '')
}

function hydraTenantId() {
  return process.env.HYDRADB_TENANT_ID || HYDRADB_DEFAULT_TENANT_ID
}

function hydraProfileTitle(userId) {
  return `${HYDRADB_PROFILE_TITLE_PREFIX}: ${userId}`
}

function serializeHydraProfile(profile) {
  return [
    '# Corgi Cafe Memory Profile',
    '',
    '```json',
    JSON.stringify(profile, null, 2),
    '```',
  ].join('\n')
}

function extractHydraProfile(sources = [], userId) {
  const matchingSources = sources
    .filter((source) => source?.title === hydraProfileTitle(userId))
    .sort((a, b) => new Date(hydraTimestamp(b)) - new Date(hydraTimestamp(a)))

  for (const source of matchingSources) {
    const parsed = parseHydraProfileText(hydraText(source))
    if (parsed) return parsed
  }

  return null
}

function listHydraItems(response) {
  return response?.sources || response?.memories || response?.results || []
}

function hydraText(source) {
  return source?.content?.markdown || source?.content?.text || source?.text || source?.note || ''
}

function hydraTimestamp(source) {
  return source?.timestamp || source?.created_at || source?.updated_at || 0
}

function parseHydraProfileText(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/({[\s\S]*})/)
  if (!match) return null

  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}
