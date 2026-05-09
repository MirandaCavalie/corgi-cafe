import OpenAI from 'openai'

// Pipeshift serves long-context models via OpenAI-compatible API
// Falls back to OpenAI if PIPESHIFT_API_KEY is not set
const isPipeshift = !!process.env.PIPESHIFT_API_KEY

const client = new OpenAI({
  apiKey: isPipeshift ? process.env.PIPESHIFT_API_KEY : process.env.OPENAI_API_KEY,
  baseURL: isPipeshift
    ? (process.env.PIPESHIFT_BASE_URL || 'https://api.pipeshift.ai/v1')
    : undefined,
})

// Pipeshift long-context model; falls back to gpt-4o-mini for demo
const MODEL = isPipeshift
  ? (process.env.PIPESHIFT_MODEL || 'kimi-k2-0711-preview')
  : 'gpt-4o-mini'

export async function chat(systemPrompt, userMessage, fullContext = '') {
  const messages = [
    { role: 'system', content: systemPrompt },
  ]

  if (fullContext) {
    messages.push({
      role: 'user',
      content: `[FULL CONTEXT — user memory, history, and document if any]\n\n${fullContext}\n\n[END CONTEXT]`,
    })
    messages.push({
      role: 'assistant',
      content: 'Got it! I have full context loaded. Ready to chat.',
    })
  }

  messages.push({ role: 'user', content: userMessage })

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.8,
    max_tokens: 600,
  })

  const raw = response.choices[0].message.content.trim()

  // Parse JSON response
  try {
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    return JSON.parse(cleaned)
  } catch {
    // Fallback: wrap plain text in expected structure
    return {
      message: raw.slice(0, 300),
      corgiState: 'idle',
      drinkRecommendation: null,
      contextInsights: null,
      memoryUpdate: null,
      proactiveNudge: null,
    }
  }
}
