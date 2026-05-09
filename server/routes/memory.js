import { Router } from 'express'
import { getUser, updateUser } from '../services/hydradb.js'

const router = Router()

router.get('/:userId', async (req, res) => {
  try {
    const profile = await getUser(req.params.userId)
    res.json(profile)
  } catch (err) {
    console.error('Memory GET error:', err)
    res.status(500).json({ error: 'Failed to retrieve memory' })
  }
})

router.post('/:userId', async (req, res) => {
  try {
    const updates = req.body
    const updated = await updateUser(req.params.userId, updates)
    res.json(updated)
  } catch (err) {
    console.error('Memory POST error:', err)
    res.status(500).json({ error: 'Failed to update memory' })
  }
})

export default router
