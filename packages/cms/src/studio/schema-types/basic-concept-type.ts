import { defineField, defineType } from 'sanity';

export const basicConceptType = defineType({
  name: 'basicConcept',
  title: 'Basic Concept',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'commonAcronym',
      title: 'Common Acronym - Optional',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        slugify: input =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .slice(0, 96)
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''),
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'relatedLegacyPost',
      title: 'Related Legacy Post',
      type: 'reference',
      to: [{ type: 'post' }],
    }),
  ],
});
