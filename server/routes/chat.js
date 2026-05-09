import { Router } from 'express'
import { chat } from '../services/pipeshift.js'
import { getUser, addVisit } from '../services/hydradb.js'
import { CORGI_SYSTEM_PROMPT } from '../prompts/corgiPersona.js'
import { buildFullContext } from '../services/drinkEngine.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { userId, message, workContext } = req.body

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message required' })
    }

    const userProfile = await getUser(userId)
    const fullContext = buildFullContext(userProfile)

    const result = await chat(CORGI_SYSTEM_PROMPT, message, fullContext)

    // Persist the visit with mood + drink if extracted
    if (result.memoryUpdate || result.drinkRecommendation) {
      await addVisit(userId, {
        mood: result.memoryUpdate?.mood || null,
        drinkOrdered: result.drinkRecommendation?.name || null,
        conversationSummary: result.memoryUpdate?.workContext || message.slice(0, 120),
      })
    }

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
    })
  }
})

export default router
