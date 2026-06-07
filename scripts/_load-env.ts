/**
 * Carrega .env na ordem certa:
 *   1. prod.env (se existir) — gerado por `vercel env pull --environment=production`
 *   2. .env.local — para dev local
 *
 * Tem que rodar ANTES de qualquer import de payload/payload.config,
 * porque ESM faz hoisting de imports e `secret: process.env.PAYLOAD_SECRET`
 * é avaliado na hora do import.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'

if (existsSync('prod.env')) {
  loadEnv({ path: 'prod.env', override: true })
}
if (existsSync('.env.local')) {
  loadEnv({ path: '.env.local' })
}

/**
 * Evita o "dev push" que polui a tabela payload_migrations com batch=-1
 * quando rodamos getPayload() fora do contexto de migrate.
 * Mesmo flag que o bin de payload migrate seta internamente.
 */
if (!process.env.PAYLOAD_MIGRATING) {
  process.env.PAYLOAD_MIGRATING = 'true'
}
