export function classifyIntent(message, hasDocument = false) {
  if (hasDocument) return 'upload'
  const lower = message.toLowerCase()
  if (/\b(drink|coffee|matcha|smoothie|latte|order|thirsty|caffeine|menu|recommend)\b/.test(lower)) return 'drink_request'
  if (/\b(last time|remember|history|previous|before|did i|what did|when did|how many times|have i been)\b/.test(lower)) return 'memory_query'
  if (/\b(working on|project|code|bug|deploy|build|debug|design|architect|review|pr |pull request|commit|pipeline|auth|api)\b/.test(lower)) return 'work_help'
  return 'casual'
}

export const TOOL_MAP = {
  casual:        ['retrieveSemanticMemory', 'getEnergyContext', 'surfaceForgottenContext'],
  work_help:     ['retrieveSemanticMemory', 'getEnergyContext', 'surfaceForgottenContext', 'searchThineContext'],
  upload:        ['retrieveSemanticMemory', 'getEnergyContext', 'surfaceForgottenContext', 'analyzeAndCrossReference'],
  drink_request: ['retrieveSemanticMemory', 'getEnergyContext', 'evaluateDrinkFit'],
  memory_query:  ['retrieveSemanticMemory', 'surfaceForgottenContext', 'searchThineContext'],
}
