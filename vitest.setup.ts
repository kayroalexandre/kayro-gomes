// Any setup scripts you might need go here

// Load .env files (incluindo .env.local se existir)
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'

if (existsSync('.env.local')) {
  loadEnv({ path: '.env.local' })
}
if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'test-payload-secret-do-not-use-in-prod'
}
if (!process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/test'
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token'
}
if (!process.env.PREVIEW_SECRET) {
  process.env.PREVIEW_SECRET = 'test-preview-secret'
}
if (!process.env.CRON_SECRET) {
  process.env.CRON_SECRET = 'test-cron-secret'
}
if (!process.env.NEXT_PUBLIC_SERVER_URL) {
  process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'
}
