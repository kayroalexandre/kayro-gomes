#!/usr/bin/env bash
#
# ensure-db.sh
# Garante que o banco de dados Docker está rodando.
# Chamado automaticamente pelo bun dev via predev hook.
#
# Uso: ./scripts/ensure-db.sh

set -e

# Cores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[db]${NC} $*"; }
ok() { echo -e "${GREEN}[ok]${NC} $*"; }
err() { echo -e "${RED}[error]${NC} $*"; }

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
  err "Docker não está rodando. Inicie o Docker Desktop primeiro."
  exit 1
fi

# Verificar se Postgres está rodando
if docker compose ps --format json 2>/dev/null | grep -q 'kayro-postgres.*Up'; then
  ok "Postgres já está rodando"
  exit 0
fi

# Subir banco
log "Iniciando banco de dados (Docker Compose)..."
docker compose up -d

# Aguardar Postgres ficar pronto
log "Aguardando Postgres ficar pronto..."
for i in {1..30}; do
  if docker exec kayro-postgres pg_isready -U postgres -d kayro_local >/dev/null 2>&1; then
    ok "Postgres pronto em localhost:54320"
    exit 0
  fi
  echo -n "."
  sleep 1
done

echo ""
err "Postgres não ficou pronto após 30 segundos"
exit 1
