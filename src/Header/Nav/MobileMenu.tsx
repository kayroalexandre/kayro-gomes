'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import { Icon } from '@/components/ui/icon'
import { HeaderNavItem } from './NavItem'
import type { NavLink } from './getNavItemHref'

export type MobileNavItem = { link: NavLink; active: boolean }

/**
 * Navegação mobile do Header (< md). O nav central horizontal é escondido nessa
 * faixa (vazaria sobre o logo no grid `1fr`); aqui um botão hambúrguer abre um
 * painel dropdown com os mesmos itens, reaproveitando `HeaderNavItem`.
 *
 * O painel ancora em `absolute top-full left-0 right-0`: o `<header>` é `fixed`
 * (contexto de posicionamento) e nenhum ancestral intermediário é posicionado,
 * então o dropdown ocupa a largura total logo abaixo do Header.
 *
 * Superfície SÓLIDA (`bg-background`), não `glass`: o vidro tem só ~50% de
 * opacidade — bom para a barra fina sobre o topo da página, mas ilegível como
 * painel sobre texto corrido. O `border-b` separa o painel do conteúdo.
 */
export const MobileMenu: React.FC<{ items: MobileNavItem[] }> = ({ items }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  // Fecha ao navegar para outra rota.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Fecha com Escape e com clique fora enquanto aberto.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  if (items.length === 0) return null

  return (
    <div ref={containerRef} className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex size-10 items-center justify-center rounded-full glass border border-border/20 outline-none focus-visible:focus-ring"
      >
        <Icon
          icon={open ? X : Menu}
          size="md"
          className="text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-background border-b border-border/20 py-4 shadow-lg">
          <ul id="mobile-nav" className="container flex flex-col gap-1">
            {items.map((item, i) => (
              <li key={i} className="py-1.5">
                <HeaderNavItem link={item.link} active={item.active} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
