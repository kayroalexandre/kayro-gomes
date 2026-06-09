#!/usr/bin/env bash
#
# cleanup-merged-branches.sh
# Script determinístico e profissional para deletar branches já mergeadas.
#
# Uso:
#   ./scripts/cleanup-merged-branches.sh [--dry-run] [--force] [--include-local]
#
# Opções:
#   --dry-run         Mostra o que seria deletado sem executar (padrão)
#   --force           Deleta sem pedir confirmação
#   --include-local   Também deleta branches locais mergeadas
#
# Regras (conforme AGENTS.md):
#   - Branches mergeadas em origin/develop → deletar
#   - Branches mergeadas em origin/main → deletar
#   - Branches protegidas (main, develop, dev) → NUNCA deletar
#   - Branches com worktree ativo → NUNCA deletar
#   - Branches temporárias do Vercel (vercel/*) → deletar após merge
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Cores ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

DRY_RUN=true
FORCE=false
INCLUDE_LOCAL=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --force) FORCE=true; DRY_RUN=false ;;
    --include-local) INCLUDE_LOCAL=true ;;
  esac
done

# Logging profissional
section() { echo -e "\n${CYAN}${BOLD}▶ $*${NC}"; }
log() { echo -e "  ${BLUE}→${NC} $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $*"; }
err() { echo -e "  ${RED}✗${NC} $*"; }
ok() { echo -e "  ${GREEN}✓${NC} $*"; }
skip() { echo -e "  ${YELLOW}⊘${NC} $*"; }

# Branches protegidas (NUNCA deletar)
readonly PROTECTED_BRANCHES=("main" "develop" "dev" "HEAD")

is_protected() {
  local branch="$1"
  for p in "${PROTECTED_BRANCHES[@]}"; do [[ "$branch" == "$p" ]] && return 0; done
  return 1
}

has_worktree() {
  git worktree list 2>/dev/null | grep -qE "(^|[[:space:]])$1([[:space:]]|$)" && return 0 || return 1
}

# Detectar branches mergeadas remotamente
get_remote_merged() {
  {
    git branch -r --merged origin/develop 2>/dev/null
    git branch -r --merged origin/main 2>/dev/null
  } | grep -vE 'origin/(main|develop|dev|HEAD)' \
    | sed 's|^\s*origin/||' \
    | sort -u
}

# Detectar branches mergeadas localmente (ainda não pushadas)
get_local_merged() {
  git for-each-ref --format='%(refname:short)' refs/heads/ 2>/dev/null \
    | while read -r local_branch; do
        if is_protected "$local_branch"; then continue; fi
        if has_worktree "$local_branch"; then continue; fi
        # Verifica se todos os commits da branch estão em develop ou main
        if git merge-base --is-ancestor "$local_branch" origin/develop 2>/dev/null || \
           git merge-base --is-ancestor "$local_branch" origin/main 2>/dev/null; then
          echo "$local_branch"
        fi
      done | sort -u
}

# Deletar branch remota
delete_remote() {
  local branch="$1"
  if $DRY_RUN; then
    log "[dry-run] origin/$branch"
    return 0
  fi
  if git push origin --delete "$branch" --quiet 2>&1; then
    ok "origin/$branch deletada"
    return 0
  else
    err "Falha ao deletar origin/$branch"
    return 1
  fi
}

# Deletar branch local
delete_local() {
  local branch="$1"
  if $DRY_RUN; then
    log "[dry-run] $branch (local)"
    return 0
  fi
  if git branch -D "$branch" --quiet 2>&1; then
    ok "$branch (local) deletada"
    return 0
  else
    err "Falha ao deletar $branch (local)"
    return 1
  fi
}

main() {
  section "Limpeza de Branches Mergeadas"

  if $DRY_RUN; then
    warn "MODO DRY-RUN (use --force para executar)"
  fi

  section "Sincronizando repositório"
  log "git fetch --all --prune"
  git fetch --all --prune --quiet

  section "Branches mergeadas (remotas)"
  local remote_merged
  mapfile -t remote_merged <<< "$(get_remote_merged || true)"

  if [[ ${#remote_merged[@]} -eq 0 || -z "${remote_merged[0]}" ]]; then
    ok "Nenhuma branch remota mergeada pendente"
  else
    local to_delete_remote=()
    for branch in "${remote_merged[@]}"; do
      [[ -z "$branch" ]] && continue
      if is_protected "$branch"; then skip "$branch (protegida)"; continue; fi
      if has_worktree "$branch"; then skip "$branch (worktree ativo)"; continue; fi
      to_delete_remote+=("$branch")
      log "$branch"
    done

    if [[ ${#to_delete_remote[@]} -gt 0 ]]; then
      echo ""
      if ! $FORCE && ! $DRY_RUN; then
        read -rp "  Deletar estas ${#to_delete_remote[@]} branches remotas? [y/N] " c
        [[ "$c" =~ ^[Yy]$ ]] || { log "Cancelado."; exit 0; }
      fi
      local del=0 fail=0
      for b in "${to_delete_remote[@]}"; do delete_remote "$b" && ((del++)) || ((fail++)); done
      echo ""
      ok "$del remotas deletadas"
      [[ $fail -gt 0 ]] && err "$fail falharam"
    fi
  fi

  if $INCLUDE_LOCAL; then
    section "Branches mergeadas (locais)"
    local local_merged
    mapfile -t local_merged <<< "$(get_local_merged || true)"

    if [[ ${#local_merged[@]} -eq 0 || -z "${local_merged[0]}" ]]; then
      ok "Nenhuma branch local mergeada pendente"
    else
      local to_delete_local=()
      for branch in "${local_merged[@]}"; do
        [[ -z "$branch" ]] && continue
        to_delete_local+=("$branch")
        log "$branch"
      done

      if [[ ${#to_delete_local[@]} -gt 0 ]]; then
        echo ""
        if ! $FORCE && ! $DRY_RUN; then
          read -rp "  Deletar estas ${#to_delete_local[@]} branches locais? [y/N] " c
          [[ "$c" =~ ^[Yy]$ ]] || { log "Cancelado."; exit 0; }
        fi
        local del=0 fail=0
        for b in "${to_delete_local[@]}"; do delete_local "$b" && ((del++)) || ((fail++)); done
        echo ""
        ok "$del locais deletadas"
        [[ $fail -gt 0 ]] && err "$fail falharam"
      fi
    fi
  fi

  section "Resumo"
  if $DRY_RUN; then
    warn "Execute com --force para aplicar as deleções"
  else
    ok "Limpeza concluída. Repositório limpo."
  fi
  echo ""
}

main "$@"
