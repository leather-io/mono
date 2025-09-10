import { BasketIcon, ComponentIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { slugField } from '../utils/slug-type';

export const legacyHelpCenterCategoryType = defineType({
  name: 'legacyHelpCenterCategory',
  title: 'Legacy Help Center Category',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'categoryName',
      title: 'Category Name',
      type: 'string',
      validation: rule => rule.required(),
    }),
    slugField('categoryName'),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'guides',
      title: 'Guides',
      type: 'array',
      validation: rule => rule.required(),
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'post' }],
          validation: rule => rule.required(),
        }),
      ],
    }),
  ],
});

export const legacyHelpCenterPage = defineType({
  name: 'legacyHelpCenterPage',
  title: 'Legacy Help Center Page',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'legacyHelpCenterCategory' }],
          validation: rule => rule.required(),
        }),
      ],
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: {
      categories: 'categories',
    },
    prepare(selection) {
      const { categories } = selection;
      return {
        title: `${categories ? categories.length : 0} Category Help Center Page`,
      };
    },
  },
});
