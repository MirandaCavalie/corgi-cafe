import pg from 'pg'

const { Pool } = pg

let pool
let schemaReady = false

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for Postgres memory storage')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }

  return pool
}

async function ensureSchema() {
  if (schemaReady) return

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS user_memory_profiles (
      user_id TEXT PRIMARY KEY,
      profile JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  schemaReady = true
}

export async function getUserFromPostgres(userId) {
  await ensureSchema()

  const result = await getPool().query(
    'SELECT profile FROM user_memory_profiles WHERE user_id = $1',
    [userId],
  )

  return result.rows[0]?.profile || null
}

export async function saveUserToPostgres(userId, profile) {
  await ensureSchema()

  const result = await getPool().query(
    `INSERT INTO user_memory_profiles (user_id, profile, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET profile = EXCLUDED.profile, updated_at = NOW()
     RETURNING profile`,
    [userId, profile],
  )

  return result.rows[0].profile
}

export async function closeDatabasePool() {
  if (!pool) return

  await pool.end()
  pool = null
  schemaReady = false
}
