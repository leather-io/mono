import { ArchiveIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const postType = defineType({
  name: 'post',
  title: 'Post (Legacy)',
  type: 'document',
  icon: ArchiveIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Apps', value: 'Apps' },
          { title: 'Bitcoin', value: 'Bitcoin' },
          { title: 'Wallet', value: 'Wallet' },
          { title: 'DeFi', value: 'DeFi' },
          { title: 'NFTs', value: 'NFTs' },
          { title: 'Stacks', value: 'Stacks' },
          { title: 'Security', value: 'Security' },
        ],
      },
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'General' },
          { title: 'Stablecoins', value: 'Stablecoins' },
          { title: 'Basics', value: 'Basics' },
          { title: 'Lending', value: 'Lending' },
          { title: 'Trading', value: 'Trading' },
          { title: 'Infrastructure', value: 'Infrastructure' },
          { title: 'Governance', value: 'Governance' },
          { title: 'Gaming', value: 'Gaming' },
        ],
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 8,
      description:
        'Main content of the post. Will be imported as markdown and converted to blocks.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'sentence',
      title: 'Sentence',
      type: 'string',
      description: 'Short description or tagline',
    }),
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'Related question this post answers',
    }),
    defineField({
      name: 'prompt',
      title: 'Prompt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'icons',
      title: 'Icons',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'disclaimer',
      title: 'Disclaimer',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Display order for sorting',
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'All', value: 'All' },
          { title: 'Extension', value: 'Extension' },
          { title: 'Mobile', value: 'Mobile' },
          { title: 'None', value: 'None' },
        ],
      },
    }),
    defineField({
      name: 'aliases',
      title: 'Aliases',
      type: 'string',
    }),
    defineField({
      name: 'dataPointInstructions',
      title: 'Data Point Instructions',
      type: 'text',
    }),
    defineField({
      name: 'dataPointSource',
      title: 'Data Point Source',
      type: 'string',
    }),
    defineField({
      name: 'dataPointValue',
      title: 'Data Point Value',
      type: 'string',
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'earnProviders',
      title: 'Earn Providers',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'createdTime',
      title: 'Created Time',
      type: 'datetime',
    }),
    defineField({
      name: 'log',
      title: 'Log',
      type: 'text',
      description: 'Activity log for tracking changes',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      date: 'publishedAt',
      status: 'status',
    },
    prepare(selection) {
      const { title, subtitle, date, status } = selection;
      const dateFormatted = date ? new Date(date).toLocaleDateString() : 'No date';
      return {
        title: title || 'Untitled',
        subtitle: `${subtitle || 'Uncategorized'} • ${dateFormatted} • ${status || 'draft'}`,
      };
    },
  },
});
