'use client'

import * as React from 'react'
import { useTheme } from './index'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sun, Moon } from 'lucide-react'

export const ThemeToggle: React.FC = () => {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 cursor-pointer"
      aria-label={
        mounted ? (theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro') : 'Alternar tema'
      }
      onClick={toggleTheme}
    >
      <Icon
        icon={Sun}
        size="lg"
        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground hover:text-foreground"
      />
      <Icon
        icon={Moon}
        size="lg"
        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground hover:text-foreground"
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
