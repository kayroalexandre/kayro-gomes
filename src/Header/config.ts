import type { GlobalConfig } from 'payload'

import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
        description: 'Selecione os itens de navegação a exibir no Header (ordem importa).',
      },
    },
    {
      name: 'searchEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Enable Site Search',
      admin: {
        description:
          'When enabled, shows the search icon in the header and enables the /search page.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
  versions: false,
}
