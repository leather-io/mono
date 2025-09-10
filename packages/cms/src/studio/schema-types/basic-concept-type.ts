import { defineField, defineType } from 'sanity';

import { slugField } from './utils/slug-type';

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
    slugField('name'),
    defineField({
      name: 'relatedLegacyPost',
      title: 'Related Legacy Post',
      type: 'reference',
      to: [{ type: 'post' }],
    }),
  ],
});
