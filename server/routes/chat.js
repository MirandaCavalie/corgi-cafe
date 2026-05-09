import { Router } from 'express'
import { callLLM } from '../services/pipeshift.js'
import { getUser } from '../services/hydradb.js'
import { classifyIntent, TOOL_MAP } from '../services/classifier.js'
import { buildContext } from '../services/contextBuilder.js'
import {
  retrieveSemanticMemory,
  getEnergyContext,
  surfaceForgottenContext,
  searchThineContext,
  analyzeAndCrossReference,
  evaluateDrinkFit,
  updateMemory,
} from '../services/tools.js'

const router = Router()

export async function agentPipeline(userId, message, conversation = [], document = null) {
  const startTime = Date.now()

  // Stage 1: Assess
  const intent = classifyIntent(message, !!document)
  const toolKeys = TOOL_MAP[intent] ?? TOOL_MAP.casual

  // Stage 2: Gather (parallel)
  const toolPromises = {}

  // For upload intent, fetch episodic data first so analyzeAndCrossReference can use it
  let preloadedEpisodic = null
  if (toolKeys.includes('analyzeAndCrossReference')) {
    const user = await getUser(userId)
    preloadedEpisodic = user?.episodic ?? user?.visitHistory ?? []
  }

  if (toolKeys.includes('retrieveSemanticMemory')) {
    toolPromises.semanticMemory = retrieveSemanticMemory(userId)
  }
  if (toolKeys.includes('getEnergyContext')) {
    toolPromises.energyContext = getEnergyContext(userId)
  }
  if (toolKeys.includes('surfaceForgottenContext')) {
    toolPromises.forgottenContext = surfaceForgottenContext(userId)
  }
  if (toolKeys.includes('searchThineContext')) {
    toolPromises.thineContext = searchThineContext(message, userId)
  }
  if (toolKeys.includes('analyzeAndCrossReference') && document) {
    toolPromises.crossReference = analyzeAndCrossReference(document, preloadedEpisodic)
  }
  if (toolKeys.includes('evaluateDrinkFit')) {
    toolPromises.drinkFit = (async () => {
      const energy = await getEnergyContext(userId)
      return evaluateDrinkFit(userId, energy)
    })()
  }

  const keys = Object.keys(toolPromises)
  const values = await Promise.all(Object.values(toolPromises))
  const toolOutputs = Object.fromEntries(keys.map((k, i) => [k, values[i]]))

  // Stage 3: Synthesize
  const memory = await getUser(userId)
  const { assembledContext, tokenEstimate, breakdown } = buildContext(
    userId, toolOutputs, document, conversation, memory
  )

  const parsed = await callLLM(assembledContext, message)

  // Persist memory
  if (parsed.memoryUpdate) {
    await updateMemory(userId, {
      ...parsed.memoryUpdate,
      drinkOrdered: parsed.drinkRecommendation?.name ?? null,
      visitSummary: parsed.memoryUpdate.workContext ?? message.slice(0, 120),
    })
  }

  const totalTimeMs = Date.now() - startTime

  return {
    ...parsed,
    meta: {
      intent,
      toolsUsed: toolKeys,
      tokenEstimate,
      contextBreakdown: breakdown,
      totalTimeMs,
    },
  }
}

router.post('/', async (req, res) => {
  try {
    const { userId, message, conversation = [], document } = req.body

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message required' })
    }

    const result = await agentPipeline(userId, message, conversation, document)
    res.json(result)
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({
      message: "Woof, something went sideways on my end. Try again?",
      corgiState: 'idle',
      drinkRecommendation: null,
      contextInsights: null,
      memoryUpdate: null,
      proactiveNudge: null,
      crossSessionReference: null,
      meta: { intent: 'unknown', toolsUsed: [], tokenEstimate: 0, totalTimeMs: 0 },
    })
  }
})

export default router
