'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './index'
import { Button } from '@/components/ui/button'

export const ThemeToggle: React.FC = () => {
  const { setTheme, theme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 cursor-pointer border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground hover:text-foreground" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground hover:text-foreground" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
