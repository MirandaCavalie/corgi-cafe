import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import chatRouter from './routes/chat.js'
import memoryRouter from './routes/memory.js'
import uploadRouter from './routes/upload.js'
import { DRINK_MENU } from './prompts/corgiPersona.js'

config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/chat', chatRouter)
app.use('/api/memory', memoryRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/vibe-check', uploadRouter)

app.get('/api/menu', (_, res) => {
  res.json(DRINK_MENU)
})

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    model: process.env.PIPESHIFT_API_KEY ? 'pipeshift' : 'openai-fallback',
    memory: process.env.HYDRADB_API_KEY ? 'hydradb' : 'local-json',
    thine: process.env.THINE_API_KEY ? 'thine' : 'mock',
  })
})

app.listen(PORT, () => {
  console.log(`\u{1F43E} Corgi Memory server running on :${PORT}`)
  console.log(`   Model: ${process.env.PIPESHIFT_API_KEY ? 'Pipeshift' : 'OpenAI fallback'}`)
  console.log(`   Memory: ${process.env.HYDRADB_API_KEY ? 'HydraDB' : 'Local JSON'}`)
})
