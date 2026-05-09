import { CORGI_SYSTEM_PROMPT } from '../prompts/corgiPersona.js'

const MAX_CHARS = 3_200_000 // ~800K tokens safety cap

export function buildContext(userId, toolOutputs, document, conversation, memory) {
  const breakdown = []

  function section(label, content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    breakdown.push({ label, tokens: Math.round(text.length / 4) })
    return `\n\n--- ${label.toUpperCase()} ---\n\n${text}`
  }

  let parts = CORGI_SYSTEM_PROMPT
  breakdown.push({ label: 'system_prompt', tokens: Math.round(CORGI_SYSTEM_PROMPT.length / 4) })

  // Semantic memory
  if (toolOutputs.semanticMemory) {
    parts += section('semantic_memory', toolOutputs.semanticMemory)
  }

  // Prospective / unresolved items
  if (toolOutputs.forgottenContext) {
    parts += section('forgotten_context', toolOutputs.forgottenContext)
  }

  // Energy context
  if (toolOutputs.energyContext) {
    parts += section('energy_context', toolOutputs.energyContext)
  }

  // Drink fit evaluation
  if (toolOutputs.drinkFit) {
    parts += section('drink_fit', toolOutputs.drinkFit)
  }

  // Thine personal context
  if (toolOutputs.thineContext) {
    parts += section('personal_context_thine', toolOutputs.thineContext)
  }

  // Cross-reference metadata (from document upload)
  if (toolOutputs.crossReference) {
    parts += section('document_cross_reference_meta', toolOutputs.crossReference)
  }

  // Full episodic history — the 1M-token showcase
  const episodic = memory?.episodic ?? memory?.visitHistory ?? []
  if (episodic.length > 0) {
    parts += section('full_episodic_history', episodic)
  }

  // Uploaded document — full text, no truncation
  if (document) {
    parts += section('uploaded_document', document)
  }

  // Current conversation
  if (conversation && conversation.length > 0) {
    const convText = conversation
      .map(m => `${m.role === 'user' ? 'USER' : 'CORGI'}: ${m.content}`)
      .join('\n')
    parts += section('current_conversation', convText)
  }

  // Safety cap: trim oldest episodic entries if over limit
  if (parts.length > MAX_CHARS && episodic.length > 0) {
    let trimmed = episodic.slice()
    while (parts.length > MAX_CHARS && trimmed.length > 1) {
      trimmed = trimmed.slice(1)
      // Rebuild just the episodic section
      const episodicChars = JSON.stringify(trimmed, null, 2).length
      parts = parts.replace(
        /--- FULL_EPISODIC_HISTORY ---[\s\S]*?(?=\n\n---|$)/,
        `--- FULL_EPISODIC_HISTORY ---\n\n${JSON.stringify(trimmed, null, 2)}`
      )
    }
  }

  const tokenEstimate = Math.round(parts.length / 4)

  return { assembledContext: parts, tokenEstimate, breakdown }
}
