import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { getActiveStorageLayer } from './hydradb.js'

const ORIGINAL_ENV = {
  HYDRADB_API_KEY: process.env.HYDRADB_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
}

afterEach(() => {
  restoreEnv('HYDRADB_API_KEY')
  restoreEnv('DATABASE_URL')
})

function restoreEnv(key) {
  if (ORIGINAL_ENV[key] === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = ORIGINAL_ENV[key]
  }
}

test('uses HydraDB when HYDRADB_API_KEY is set, even with DATABASE_URL', () => {
  process.env.HYDRADB_API_KEY = 'hydra-key'
  process.env.DATABASE_URL = 'postgres://example'

  assert.deepEqual(getActiveStorageLayer(), {
    id: 'hydradb',
    label: 'HydraDB',
  })
})

test('uses Postgres when DATABASE_URL is set and HydraDB is not configured', () => {
  delete process.env.HYDRADB_API_KEY
  process.env.DATABASE_URL = 'postgres://example'

  assert.deepEqual(getActiveStorageLayer(), {
    id: 'postgres',
    label: 'Postgres',
  })
})

test('uses local memory.json when no persistent storage is configured', () => {
  delete process.env.HYDRADB_API_KEY
  delete process.env.DATABASE_URL

  assert.deepEqual(getActiveStorageLayer(), {
    id: 'memory-json',
    label: 'memory.json',
  })
})
