import { defineField } from 'sanity';

import { defaultSlugify } from '../../utils/default-slugify';

export function slugField(slugifySource: string) {
  return defineField({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {
      maxLength: 96,
      source: slugifySource,
      slugify: defaultSlugify,
    },
    validation: rule => rule.required(),
  });
}
