import { defineField, defineType } from 'sanity';

import { slugField } from './utils/slug-type';

export const changelogType = defineType({
  name: 'changelog',
  title: 'Changelog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    slugField('title'),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      description: 'The date and time when this changelog entry is to be live from',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      description: `
You are a changelog editor. Your task:

1. **Audit** the given text. Identify issues relative to technical changelog best practices:
   - Wordiness or filler
   - Passive voice
   - Lack of structure or grouping
   - Missing explanation of user impact
   - Overly long paragraphs or inconsistent formatting

2. **Rewrite** the text to match these guidelines:
   - Begin with a short, clear feature or change title
   - Add a one-to-two sentence summary if missing
   - Use present-tense active verbs ("Fixed", "Added", "Improved")
   - Present details as concise bulleted lists grouped by category
   - Remove filler words, keep entries short
   - Add links or references where useful
   - Where possible, state why the change matters
   - Maintain consistent capitalization and minimal punctuation

3. **Output**:
   - The audit commentary (bulleted list of issues found)
   - The rewritten version

The  original text is below. Rewrite it in concise, structured, technical changelog style.
      `,
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
          },
        },
        { type: 'image' },
        { type: 'code', options: { highlightedLines: true } },
      ],
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tag' }],
        },
      ],
    }),
  ],
});
