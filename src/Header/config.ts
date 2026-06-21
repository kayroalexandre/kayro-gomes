import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'searchEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Enable Site Search',
      admin: {
        description: 'When enabled, shows the search icon in the header and enables the /search page.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
  versions: false,
}
