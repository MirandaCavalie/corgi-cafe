/**
 * Thine API adapter — pulls structured personal context from user conversations/meetings.
 * Mocked until THINE_API_KEY is available.
 */

export async function getPersonalContext(userId) {
  if (process.env.THINE_API_KEY) {
    // TODO: swap in real Thine API call
    // const client = new ThineClient({ apiKey: process.env.THINE_API_KEY })
    // return await client.getContext(userId)
  }

  // Mock: return empty context (HydraDB has the real memory)
  return {
    recentMeetings: [],
    pendingTasks: [],
    recentDocuments: [],
  }
}
