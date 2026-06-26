'use client'

import { useState, useEffect, useCallback, type FC } from 'react'
import { useTheme } from './index'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sun, Moon } from 'lucide-react'

export const ThemeToggle: FC = () => {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <Button
      // `variant="link"` é o único sem background no hover — evita o `hover:bg-accent`
      // (verde) do `ghost`. O círculo (40px, size-10) tem o efeito `glass` do Header
      // como estado DEFAULT (sempre visível); o hover afeta APENAS o ícone, que fica
      // branco (`group-hover:text-foreground`).
      variant="link"
      size="icon"
      className="group relative cursor-pointer rounded-full glass border border-border/20"
      aria-label={
        mounted ? (theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro') : 'Alternar tema'
      }
      onClick={toggleTheme}
    >
      <Icon
        icon={Sun}
        size="md"
        className="rotate-0 scale-100 text-muted-foreground transition-all group-hover:text-foreground dark:-rotate-90 dark:scale-0"
      />
      <Icon
        icon={Moon}
        size="md"
        className="absolute rotate-90 scale-0 text-muted-foreground transition-all group-hover:text-foreground dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
