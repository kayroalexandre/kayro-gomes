import type { GlobalConfig } from 'payload'

import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'menu',
      type: 'relationship',
      relationTo: 'menu',
      hasMany: true,
      admin: {
        description: 'Selecione os itens de navegação a exibir no Footer (ordem importa).',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
  versions: false,
}
