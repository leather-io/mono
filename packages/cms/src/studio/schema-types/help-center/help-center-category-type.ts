import { FolderIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

import { slugField } from '../utils/slug-type';

export const helpCenterCategoryType = defineType({
  name: 'helpCenterCategory',
  title: 'Help Center Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: rule => rule.required(),
    }),
    slugField('name'),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls display order on the help center page',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      order: 'order',
    },
    prepare(selection) {
      const { title, order } = selection;
      return {
        title: title || 'Untitled',
        subtitle: order !== undefined ? `Order: ${order}` : '',
      };
    },
  },
});
