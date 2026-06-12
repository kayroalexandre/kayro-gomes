import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const pages = await payload.find({
    collection: 'pages',
    limit: 100,
    depth: 0,
    req,
  })

  for (const page of pages.docs) {
    let updated = false
    const layout = page.layout?.map((block) => {
      if (block.blockType === 'archive' && block.introContent) {
        const introContent = block.introContent as Record<string, unknown>
        if (
          introContent.root &&
          typeof introContent.root === 'object' &&
          Array.isArray((introContent.root as Record<string, unknown>).children) &&
          ((introContent.root as Record<string, unknown>).children as unknown[]).length === 0
        ) {
          payload.logger.info(`Fixing empty lexical state on page "${page.title}" inside Archive block...`)
          const updatedBlock = { ...block, introContent: null }
          updated = true
          return updatedBlock
        }
      }
      return block
    })

    if (updated) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: {
          layout,
        },
        context: {
          disableRevalidate: true,
        },
        req,
      })
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data cleanup down migration can remain no-op
}
