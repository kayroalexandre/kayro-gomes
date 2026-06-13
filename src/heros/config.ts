import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'overlayEnabled',
      type: 'checkbox',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
      },
      defaultValue: false,
      label: 'Enable Background Overlay',
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      admin: {
        condition: (_, { type, overlayEnabled } = {}) => type === 'highImpact' && overlayEnabled === true,
      },
      defaultValue: 60,
      label: 'Overlay Opacity (%)',
      max: 100,
      min: 0,
    },
    {
      name: 'bottomFadeEnabled',
      type: 'checkbox',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
      },
      defaultValue: true,
      label: 'Enable Bottom Fade Gradient',
    },
    {
      name: 'heroImageFit',
      type: 'select',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Controls how the background image fits the hero area.',
      },
      defaultValue: 'cover',
      label: 'Image Fit Mode',
      options: [
        {
          label: 'Cover — Fills the area, cropping if necessary',
          value: 'cover',
        },
        {
          label: 'Contain — Shows full image without cropping',
          value: 'contain',
        },
      ],
    },
    {
      name: 'scrollIndicator',
      type: 'group',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show scroll indicator',
        },
        {
          name: 'position',
          type: 'select',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled !== false,
          },
          defaultValue: 'bottom',
          label: 'Position',
          options: [
            {
              label: 'Always at bottom of hero',
              value: 'bottom',
            },
            {
              label: 'Inline with content (distributed evenly)',
              value: 'inline',
            },
          ],
        },
      ],
      label: 'Scroll Indicator',
    },
  ],
  label: false,
}
