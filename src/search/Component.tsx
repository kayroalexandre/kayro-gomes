'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useRef, type FC } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

export const Search: FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  // Pula o primeiro efeito (mount) para evitar `router.push('/search')` redundante
  // na primeira renderização quando o valor está vazio.
  const isFirstRender = useRef(true)
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    router.push(`/search${debouncedValue ? `?q=${encodeURIComponent(debouncedValue)}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          Buscar
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Buscar..."
        />
        <button type="submit" className="sr-only">
          Buscar
        </button>
      </form>
    </div>
  )
}
