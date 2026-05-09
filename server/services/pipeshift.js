const FALLBACK = {
  message: "Woof... my brain glitched. Try again?",
  corgiState: 'sleepy',
  drinkRecommendation: null,
  contextInsights: null,
  memoryUpdate: null,
  proactiveNudge: null,
  crossSessionReference: null,
}

export async function callLLM(assembledContext, userMessage) {
  let raw

  if (process.env.ANTHROPIC_API_KEY) {
    raw = await callAnthropic(assembledContext, userMessage)
  } else if (process.env.PIPESHIFT_API_KEY) {
    raw = await callOpenAICompatible(assembledContext, userMessage, {
      apiKey:  process.env.PIPESHIFT_API_KEY,
      baseUrl: process.env.PIPESHIFT_BASE_URL || 'https://api.pipeshift.com/api/v0/chat/completions',
      model:   process.env.PIPESHIFT_MODEL    || 'moonshotai/Kimi-K2.6',
    })
  } else if (process.env.OPENAI_API_KEY) {
    raw = await callOpenAICompatible(assembledContext, userMessage, {
      apiKey:  process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      model:   'gpt-4o-mini',
    })
  } else {
    throw new Error('No API key found. Set ANTHROPIC_API_KEY, PIPESHIFT_API_KEY, or OPENAI_API_KEY in .env')
  }

  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return { ...FALLBACK, message: raw.slice(0, 300) }
  }
}

async function callAnthropic(assembledContext, userMessage) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-api-key':       process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: assembledContext,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    console.error('Anthropic API error:', data.error ?? response.status)
    return JSON.stringify(FALLBACK)
  }

  const block = data.content?.find(b => b.type === 'text')
  return block?.text ?? JSON.stringify(FALLBACK)
}

async function callOpenAICompatible(assembledContext, userMessage, { apiKey, baseUrl, model }) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens:  800,
      messages: [
        { role: 'system', content: assembledContext },
        { role: 'user',   content: userMessage },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    console.error('OpenAI-compatible API error:', data.error ?? response.status)
    return JSON.stringify(FALLBACK)
  }

  return data.choices?.[0]?.message?.content ?? JSON.stringify(FALLBACK)
}
