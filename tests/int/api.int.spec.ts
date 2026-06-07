import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

/**
 * Os testes de integração exigem um Postgres real rodando.
 * Em CI, subimos um Postgres descartável via service container.
 * Em dev local, use `docker compose up -d` ou defina DATABASE_URL
 * apontando para um Postgres disponível.
 *
 * Se a conexão falhar, o teste é skipado em vez de quebrar o build.
 */
const DATABASE_AVAILABLE = !!process.env.POSTGRES_URL && process.env.POSTGRES_URL !== 'postgresql://test:test@localhost:5432/test'

describe('API', () => {
  beforeAll(async () => {
    if (!DATABASE_AVAILABLE) {
      console.warn('[test:int] POSTGRES_URL não aponta para um banco real. Teste skipado.')
      return
    }
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    if (!DATABASE_AVAILABLE) {
      console.warn('[test:int] Sem banco de dados disponível. Skip.')
      return
    }
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
