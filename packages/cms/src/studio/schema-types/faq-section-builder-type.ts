import { defineArrayMember, defineField, defineType } from 'sanity';

export const faqSectionBuilderType = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'faqBuilder',
      title: 'FAQ section builder',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'FAQ item',
          type: 'reference',
          to: [{ type: 'faq' }],
        }),
      ],
      validation: rule => rule.required(),
    }),
  ],
});
