#!/usr/bin/env bash
#
# merge-to-develop.sh
# Script determinístico para mergear branches de trabalho em `develop`.
#
# Uso:
#   ./scripts/merge-to-develop.sh [branch1 branch2 ...]
#
# Se nenhuma branch for passada, o script detecta automaticamente branches
# remotas que NÃO estão mergeadas em origin/develop.
#
# Regras determinísticas de conflito:
#   - .github/workflows/ci.yml → mantém versão HEAD (develop)
#   - src/endpoints/seed/* → mantém versão HEAD (develop)
#   - src/migrations/index.ts → mantém versão HEAD (develop)
#   - src/components/ProjectCard/* → mantém versão HEAD (develop)
#
# Fluxo:
#   1. git fetch --all
#   2. checkout develop && pull
#   3. para cada branch: merge --no-edit (auto-resolve conflitos conhecidos)
#   4. git push origin develop
#   5. (opcional) deletar branches mergeadas
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[merge]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err() { echo -e "${RED}[error]${NC} $*"; }
ok() { echo -e "${GREEN}[ok]${NC} $*"; }

# Branches que devem ser ignoradas (legadas, temporárias, etc.)
IGNORE_PATTERNS=(
  "origin/HEAD"
  "origin/main"
  "origin/dev"
  "origin/develop"
  "origin/glorious-scribe"
)

# Função para resolver conflitos automaticamente (HEAD wins)
auto_resolve_conflicts() {
  local conflicted_files
  conflicted_files=$(git diff --name-only --diff-filter=U 2>/dev/null || true)

  if [[ -z "$conflicted_files" ]]; then
    return 0
  fi

  log "Resolvendo conflitos automaticamente (HEAD wins)..."

  while IFS= read -r file; do
    case "$file" in
      .github/workflows/ci.yml | \
      src/endpoints/seed/* | \
      src/migrations/index.ts | \
      src/components/ProjectCard/* | \
      src/payload-types.ts | \
      src/payload.config.ts)
        log "  → $file: mantendo versão HEAD (develop)"
        git checkout --ours "$file"
        git add "$file"
        ;;
      *)
        warn "  → $file: conflito NÃO resolvido automaticamente. Resolva manualmente."
        return 1
        ;;
    esac
  done <<< "$conflicted_files"

  # Verificar se ainda há conflitos
  if git diff --check --quiet 2>/dev/null; then
    ok "Todos os conflitos resolvidos automaticamente."
    return 0
  else
    err "Ainda há conflitos não resolvidos."
    return 1
  fi
}

# Detectar branches pendentes
detect_pending_branches() {
  local branches=()

  # Se branches foram passadas como argumento, usar elas
  if [[ $# -gt 0 ]]; then
    branches=("$@")
  else
    # Detectar automaticamente branches remotas NÃO mergeadas em develop
    mapfile -t branches < <(
      git branch -r --no-merged origin/develop 2>/dev/null \
        | grep -vE "$(IFS='|'; echo "${IGNORE_PATTERNS[*]}")" \
        | sed 's|^\s*origin/||' \
        | sort
    )
  fi

  echo "${branches[@]}"
}

# Main
main() {
  log "Iniciando merge determinístico para develop..."

  # 1. Fetch
  log "Atualizando refs remotas..."
  git fetch --all --prune --quiet

  # 2. Checkout develop
  if [[ "$(git rev-parse --abbrev-ref HEAD)" != "develop" ]]; then
    log "Checkout em develop..."
    git checkout develop
  fi

  log "Pull origin/develop..."
  git pull --ff-only origin develop || {
    err "develop está atrás de origin/develop. Faça pull manualmente."
    exit 1
  }

  # 3. Detectar branches
  local pending_branches
  read -ra pending_branches <<< "$(detect_pending_branches "$@")"

  if [[ ${#pending_branches[@]} -eq 0 ]]; then
    ok "Nenhuma branch pendente para mergear."
    exit 0
  fi

  log "Branches a mergear: ${pending_branches[*]}"

  # 4. Mergear cada branch
  local merged=()
  local failed=()

  for branch in "${pending_branches[@]}"; do
    local full_ref="origin/$branch"

    if ! git ls-remote --heads origin "$branch" &>/dev/null; then
      warn "Branch $branch não existe no remote. Pulando."
      continue
    fi

    log "Mergeando $full_ref..."

    if git merge --no-edit "$full_ref" 2>&1; then
      ok "$branch mergeada com sucesso."
      merged+=("$branch")
    else
      if auto_resolve_conflicts; then
        git commit --no-edit -m "chore(merge): auto-resolve conflicts from $branch" || true
        ok "$branch mergeada (conflitos auto-resolvidos)."
        merged+=("$branch")
      else
        err "Falha ao mergear $branch. Resolva manualmente e rode o script novamente."
        failed+=("$branch")
        git merge --abort 2>/dev/null || true
      fi
    fi
  done

  # 5. Resumo
  echo ""
  log "=== RESUMO ==="
  if [[ ${#merged[@]} -gt 0 ]]; then
    ok "Mergeadas: ${merged[*]}"
  fi
  if [[ ${#failed[@]} -gt 0 ]]; then
    err "Falharam: ${failed[*]}"
    exit 1
  fi

  # 6. Push
  if [[ ${#merged[@]} -gt 0 ]]; then
    log "Pushing develop..."
    git push origin develop
    ok "develop atualizada com sucesso."
  fi

  # 7. Instruções finais
  echo ""
  log "PR: https://github.com/kayroalexandre/kayro-gomes/compare/main...develop"
  log "Após aprovação do PR #9, rode: git push origin --delete ${merged[*]}"
}

main "$@"
