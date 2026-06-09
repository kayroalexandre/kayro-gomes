# Build Docker standalone (auto-contido: não precisa rodar `DOCKER_BUILD=true pnpm build` antes).
#
# Antes: era preciso rodar manualmente `DOCKER_BUILD=true pnpm build` no host
# para gerar `.next/standalone` + `.next/static`, e só então `docker build`.
# Isso exigia sincronizar o output do host com o contexto do build, e quebrou
# o build da Vercel no passado (o `output: 'standalone'` vazava).
#
# Agora: este Dockerfile seta `DOCKER_BUILD=true` apenas dentro da fase
# `builder` e roda `pnpm run build` lá mesmo. O `next.config.ts` continua
# usando `output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined`,
# então a Vercel (que NÃO seta DOCKER_BUILD) continua sem output standalone.
# O único comando necessário é: `docker build -t kayro-gomes .`
#
# Para rodar: docker run --rm -p 3000:3000 \
#   -e PAYLOAD_SECRET=... -e POSTGRES_URL=... -e BLOB_READ_WRITE_TOKEN=... \
#   kayro-gomes

FROM node:24-alpine AS base
# Dependências só quando necessárias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia apenas os manifests para cachear as deps
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Build com output standalone (isolado do resto do sistema)
FROM base AS builder
WORKDIR /app
ENV DOCKER_BUILD=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o build standalone (próximo passo: `output: 'standalone'` em next.config.ts)
RUN corepack enable pnpm && pnpm run build

# Imagem final enxuta
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copia o output standalone gerado no builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Variáveis de ambiente obrigatórias em runtime (passar via `docker run -e` ou compose)
#   PAYLOAD_SECRET
#   POSTGRES_URL (apontando para o banco da app)
#   BLOB_READ_WRITE_TOKEN (Vercel Blob)
#   NEXT_PUBLIC_SERVER_URL (ex: http://localhost:3000 em dev)

CMD ["node", "server.js"]
