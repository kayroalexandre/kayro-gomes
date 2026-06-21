import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

/**
 * Mapeamento de blockType → componente. Os componentes aceitam o tipo
 * específico do Payload (`ArchiveBlockProps`, `ContentBlockProps`, etc.)
 * mas o union `Page['layout'][0]` é o que recebemos em runtime.
 *
 * O tipo é `Record<string, React.ComponentType<any>>` em vez de inferido
 * para evitar que o TS reduza a interseção dos props a `never` (cada
 * block tem props próprias incompatíveis). O cast em runtime é seguro
 * porque o `blockType` discrimina o union.
 */
// `any` é inevitável aqui: cada block aceita um subconjunto próprio
// de props (ArchiveBlockProps, ContentBlockProps, etc.) e o TypeScript
// não consegue representar "um componente que aceita um desses tipos"
// sem reduzir a interseção a `never`. O cast em runtime é seguro
// porque o `blockType` discrimina o union.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockComponents: Record<string, React.ComponentType<any>> = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-[var(--space-block-gap)]" key={index}>
                  <Block {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
