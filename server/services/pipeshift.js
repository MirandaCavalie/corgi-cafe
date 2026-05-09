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
  const hasPipeshift = !!process.env.PIPESHIFT_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasOpenAI    = !!process.env.OPENAI_API_KEY

  if (!hasPipeshift && !hasAnthropic && !hasOpenAI) {
    throw new Error('No API key found. Set PIPESHIFT_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in .env')
  }

  let raw
  try {
    if (hasPipeshift) {
      try {
        raw = await callOpenAICompatible(assembledContext, userMessage, {
          apiKey:   process.env.PIPESHIFT_API_KEY,
          baseUrl:  process.env.PIPESHIFT_BASE_URL || 'https://api.pipeshift.com/api/v0/chat/completions',
          model:    process.env.PIPESHIFT_MODEL    || 'moonshotai/Kimi-K2.6',
          provider: 'Pipeshift',
        })
      } catch (err) {
        if (hasAnthropic) {
          console.error('Pipeshift failed, falling back to Anthropic:', err.message)
          raw = await callAnthropic(assembledContext, userMessage)
        } else if (hasOpenAI) {
          console.error('Pipeshift failed, falling back to OpenAI:', err.message)
          raw = await callOpenAICompatible(assembledContext, userMessage, {
            apiKey:   process.env.OPENAI_API_KEY,
            baseUrl:  'https://api.openai.com/v1/chat/completions',
            model:    'gpt-4o-mini',
            provider: 'OpenAI',
          })
        } else {
          throw err
        }
      }
    } else if (hasAnthropic) {
      raw = await callAnthropic(assembledContext, userMessage)
    } else {
      raw = await callOpenAICompatible(assembledContext, userMessage, {
        apiKey:   process.env.OPENAI_API_KEY,
        baseUrl:  'https://api.openai.com/v1/chat/completions',
        model:    'gpt-4o-mini',
        provider: 'OpenAI',
      })
    }
  } catch (err) {
    console.error('All LLM providers failed:', err.message)
    return FALLBACK
  }

  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return { ...FALLBACK, message: raw.slice(0, 300) }
  }
}

async function callOpenAICompatible(assembledContext, userMessage, { apiKey, baseUrl, model, provider = 'LLM' }) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens:  16384,
      messages: [
        { role: 'system', content: assembledContext },
        { role: 'user',   content: userMessage },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`${provider} HTTP ${response.status}: ${text.slice(0, 200)}`)
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`${provider} returned non-JSON: ${text.slice(0, 200)}`)
  }

  if (data.error) {
    throw new Error(`${provider} error object: ${JSON.stringify(data.error)}`)
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    const reason = data.choices?.[0]?.finish_reason
    const reasoningTokens = data.usage?.completion_tokens_details?.reasoning_tokens ?? 0
    throw new Error(`${provider} empty content (finish_reason: ${reason}, reasoning_tokens: ${reasoningTokens})`)
  }

  return content
}

async function callAnthropic(assembledContext, userMessage) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system:     assembledContext,
      messages:   [{ role: 'user', content: userMessage }],
    }),
    signal: AbortSignal.timeout(120_000),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Anthropic HTTP ${response.status}: ${text.slice(0, 200)}`)
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Anthropic returned non-JSON: ${text.slice(0, 200)}`)
  }

  if (data.error) {
    throw new Error(`Anthropic error object: ${JSON.stringify(data.error)}`)
  }

  const block = data.content?.find(b => b.type === 'text')
  if (!block?.text) {
    throw new Error('Anthropic empty content')
  }
  return block.text
}
