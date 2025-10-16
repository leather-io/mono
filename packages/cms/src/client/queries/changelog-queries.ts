import { defineQuery } from 'groq';

export const changelogQuery = defineQuery(`*[
  _type == "changelog" && publishedAt <= now()] | order(publishedAt desc){..., tags[]->{_id,name}}
`);

export const changelogQueryPreview = defineQuery(`*
  [_type == "changelog"] | order(publishedAt desc){..., tags[]->{_id,name}}
`);

export const changelogEntryBySlugQuery = defineQuery(`*
  [_type == "changelog" && slug.current == $slug][0]{..., tags[]->{_id,name}}
`);
