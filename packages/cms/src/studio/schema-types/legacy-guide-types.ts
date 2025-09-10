import { defineArrayMember, defineField, defineType } from 'sanity';

export const legacyGuideSectionType = defineType({
  name: 'legacyGuideSection',
  title: 'Legacy Guide Section',
  type: 'document',
  fields: [
    defineField({
      name: 'sectionTitle',
      title: 'Section Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'sectionCategories',
      title: 'Section Categories',
      type: 'array',
      validation: rule => rule.required(),
      of: [
        defineField({
          name: 'category',
          title: 'Category',
          type: 'object',
          validation: rule => rule.required(),
          fields: [
            defineField({
              name: 'categoryTitle',
              title: 'Category Title',
              type: 'string',
              validation: rule => rule.required(),
            }),
            defineField({
              name: 'categoryPosts',
              title: 'Category Posts',
              type: 'array',
              validation: rule => rule.required(),
              of: [
                defineArrayMember({
                  name: 'legacyPosts',
                  type: 'reference',
                  to: [{ type: 'post' }],
                  validation: rule => rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

export const legacyGuidesPageBuilderType = defineType({
  name: 'legacyGuidesPageBuilder',
  title: 'Legacy Guides Page Builder',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      validation: rule => rule.required(),
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'legacyGuideSection' }],
          validation: rule => rule.required(),
        }),
      ],
    }),
  ],
});
