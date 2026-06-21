import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28">
      <h1 className="type-title-sm md:type-title text-foreground mb-4">404</h1>
      <p className="type-body text-muted-foreground mb-8">Página não encontrada.</p>
      <Button asChild variant="default">
        <Link href="/">Voltar para o início</Link>
      </Button>
    </div>
  )
}
