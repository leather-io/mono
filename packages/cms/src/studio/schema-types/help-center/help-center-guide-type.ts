import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

import { slugField } from '../utils/slug-type';

export const helpCenterGuideType = defineType({
  name: 'helpCenterGuide',
  title: 'Help Center Guide',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    slugField('title'),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Brief introduction displayed alongside the title',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'markdown',
    }),
    defineField({
      name: 'disclaimer',
      title: 'Disclaimer',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'relatedGuides',
      title: 'Related Guides',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'helpCenterGuide' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
    },
    prepare(selection) {
      const { title, date } = selection;
      const dateFormatted = date ? new Date(date).toLocaleDateString() : 'No date';
      return {
        title: title || 'Untitled',
        subtitle: dateFormatted,
      };
    },
  },
});
