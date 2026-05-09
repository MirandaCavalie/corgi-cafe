import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import chatRouter from './routes/chat.js'
import memoryRouter from './routes/memory.js'
import uploadRouter from './routes/upload.js'
import { DRINK_MENU } from './prompts/corgiPersona.js'
import { getActiveStorageLayer, getUser, saveUser } from './services/hydradb.js'

config()

const app = express()
const PORT = process.env.PORT || 3001

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5177',
  /\.onrender\.com$/,
]

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.use('/api/chat', chatRouter)
app.use('/api/memory', memoryRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/vibe-check', uploadRouter)

app.get('/api/menu', (_, res) => {
  res.json(DRINK_MENU)
})

app.get('/api/health', (_, res) => {
  const storage = getActiveStorageLayer()

  res.json({
    status: 'ok',
    model: process.env.PIPESHIFT_API_KEY ? 'Pipeshift'
         : process.env.ANTHROPIC_API_KEY ? 'Anthropic'
         : process.env.OPENAI_API_KEY ? 'OpenAI'
         : 'none configured',
    storage: storage.label,
    memory: storage.id,
    thine: process.env.THINE_API_KEY ? 'thine' : 'mock',
    timestamp: new Date().toISOString(),
  })
})

const __dir = dirname(fileURLToPath(import.meta.url))
const SEED_FILE = join(__dir, 'data', 'memory.json')

async function seedDemoData() {
  const storage = getActiveStorageLayer()
  if (storage.id !== 'postgres') return

  if (!existsSync(SEED_FILE)) {
    console.log('   Seed: memory.json not found, nothing to seed')
    return
  }

  try {
    const existing = await getUser('demo-user')
    if (existing?.episodic?.length || existing?.visitHistory?.length) {
      console.log('   Seed: demo-user already populated in Postgres — skipping')
      return
    }

    const data = JSON.parse(readFileSync(SEED_FILE, 'utf-8'))
    const demo = data['demo-user']
    if (!demo) {
      console.log('   Seed: no demo-user in memory.json')
      return
    }

    await saveUser('demo-user', demo)
    console.log('   Seed: demo-user inserted into Postgres')
  } catch (err) {
    console.error('   Seed failed:', err.message)
  }
}

app.listen(PORT, '0.0.0.0', async () => {
  const storage = getActiveStorageLayer()

  console.log(`\u{1F43E} Corgi Memory server running on :${PORT}`)
  console.log(`   Storage: ${storage.label}`)
  console.log(`   Model: ${process.env.PIPESHIFT_API_KEY ? 'Pipeshift'
                         : process.env.ANTHROPIC_API_KEY ? 'Anthropic'
                         : process.env.OPENAI_API_KEY ? 'OpenAI' : 'none'}`)
  await seedDemoData()
})
