const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  chat: (userId, message, context = {}) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ userId, message, ...context }),
    }),

  upload: (userId, doc) =>
    request('/upload', {
      method: 'POST',
      body: JSON.stringify({ userId, ...doc }),
    }),

  getMemory: (userId) =>
    request(`/memory/${userId}`),

  updateMemory: (userId, updates) =>
    request(`/memory/${userId}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    }),

  getMenu: () =>
    request('/menu'),

  vibeCheck: (userId, content) =>
    request('/vibe-check', {
      method: 'POST',
      body: JSON.stringify({ userId, content }),
    }),
}
