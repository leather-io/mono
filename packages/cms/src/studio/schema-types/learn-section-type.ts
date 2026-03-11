import { defineArrayMember, defineField, defineType } from 'sanity';

export const learnSectionType = defineType({
  name: 'learnSection',
  title: 'Learn Section',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Section Key',
      type: 'string',
      validation: rule => rule.required(),
      options: {
        list: [
          { title: 'Extension — Tokens', value: 'extension-tokens' },
          { title: 'Extension — Collectibles', value: 'extension-collectibles' },
          { title: 'Mobile — Home', value: 'mobile-home' },
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'learnItem',
          title: 'Learn Item',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: rule => rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
              validation: rule => rule.required(),
            }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              validation: rule => rule.required(),
              options: {
                layout: 'radio',
                list: [
                  { title: 'Guide (help center slug)', value: 'guide' },
                  { title: 'External URL', value: 'url' },
                ],
              },
            }),
            defineField({
              name: 'guideSlug',
              title: 'Guide Slug',
              type: 'string',
              hidden: ({ parent }) => parent?.linkType !== 'guide',
            }),
            defineField({
              name: 'externalUrl',
              title: 'External URL',
              type: 'url',
              hidden: ({ parent }) => parent?.linkType !== 'url',
            }),
          ],
        }),
      ],
      validation: rule => rule.required().min(1),
    }),
  ],
});
