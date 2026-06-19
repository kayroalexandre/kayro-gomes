'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container py-28">
      <h1 className="type-title-sm md:type-title text-foreground mb-4">Algo deu errado.</h1>
      <p className="type-body text-muted-foreground mb-8">
        Ocorreu um erro inesperado ao carregar esta página.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          Tentar novamente
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}
