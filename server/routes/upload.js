import { Router } from 'express'
import { chat } from '../services/pipeshift.js'
import { getUser, addVisit } from '../services/hydradb.js'
import { CORGI_SYSTEM_PROMPT } from '../prompts/corgiPersona.js'
import { buildFullContext } from '../services/drinkEngine.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { userId, name, content, type } = req.body

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content required' })
    }

    const userProfile = await getUser(userId)
    const fullContext = buildFullContext(userProfile, { name: name || 'Document', content })

    const message = `I just shared a document called "${name || 'Document'}". Please read it, give me the key insights, tell me what kind of work vibe it has, and recommend a drink to pair with this session.`

    const result = await chat(CORGI_SYSTEM_PROMPT, message, fullContext)

    await addVisit(userId, {
      mood: result.memoryUpdate?.mood || 'working',
      drinkOrdered: result.drinkRecommendation?.name || null,
      conversationSummary: `Analyzed document: ${name || 'Document'}`,
      documentsDiscussed: [{ title: name || 'Document', summary: (result.contextInsights || []).join('; ') }],
    })

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
    })
  }
})

export default router
