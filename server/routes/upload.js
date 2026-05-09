import { Router } from 'express'
import { agentPipeline } from './chat.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { userId = 'demo-user', name, content } = req.body

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content required' })
    }

    const result = await agentPipeline(userId, `Analyze this document: "${name || 'Document'}"`, [], content)
    res.json(result)
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({
      message: "Woof, I had trouble reading that doc. Maybe try pasting the text?",
      corgiState: 'idle',
      drinkRecommendation: null,
      contextInsights: null,
      memoryUpdate: null,
      proactiveNudge: null,
      crossSessionReference: null,
      meta: { intent: 'upload', toolsUsed: [], tokenEstimate: 0, totalTimeMs: 0 },
    })
  }
})

export default router
