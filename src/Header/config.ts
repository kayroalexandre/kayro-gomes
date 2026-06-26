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
      label: 'Ativar busca no site',
      admin: {
        description:
          'Quando ativado, exibe o ícone de busca no header e habilita a página /search.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
  versions: false,
}
