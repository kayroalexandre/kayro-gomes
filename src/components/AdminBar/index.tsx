'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)

  // Mede a altura real do AdminBar e publica como CSS var no <html>.
  // O Header usa `top-[var(--adminbar-h,0px)]` para deslocar para baixo
  // quando o AdminBar aparece, sem folga e sem sobreposição.
  //
  // Usamos ResizeObserver (em vez de medir uma vez) porque a altura
  // pode mudar quando o menu do usuário abre/fecha ou em viewports
  // diferentes.
  React.useEffect(() => {
    if (!show) {
      document.documentElement.style.setProperty('--adminbar-h', '0px')
      return
    }

    const el = containerRef.current
    if (!el) return

    const update = () => {
      // offsetHeight inclui padding+border. borderBox garante isso mesmo
      // se box-sizing mudar no futuro.
      const h = el.getBoundingClientRect().height
      document.documentElement.style.setProperty('--adminbar-h', `${h}px`)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      observer.disconnect()
      document.documentElement.style.setProperty('--adminbar-h', '0px')
    }
  }, [show])

  return (
    <div
      ref={containerRef}
      className={cn(
        // Payload admin-bar padrão: position:fixed + z alto. Fica
        // acima de todo o site (incluindo o Header) sem afetar o
        // layout — quando `hidden` (não logado), `display:none` remove
        // do flow completamente. Quando logado, é uma faixa fina
        // no topo que desloca o Header para baixo (via CSS var
        // `--adminbar-h`, atualizada por ResizeObserver aqui).
        baseClass,
        'fixed top-0 left-0 right-0 z-[9999] py-2 bg-black text-white',
        {
          block: show,
          hidden: !show,
        },
      )}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
