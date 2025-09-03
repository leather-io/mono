import { defineQuery } from 'groq';

export const allPostsQuery = defineQuery(`*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]`);

export const stackingPostQuery = defineQuery(`*[
  _type == "post"
  && _id == "1ead74b6-94c7-8010-a551-c0ef436999df"
][0]`);

export const postBySlugQuery = defineQuery(`*[
  _type == "post"
  && slug.current == $slug
][0]`);

export const sbtcPoolsQuery = defineQuery(`*[
  _type == "sbtcPool"
]`);

export const sbtcBasicEnrollQuery = defineQuery(`*[
  _type == "sbtcPool"
  && id == "basic"
][0]`);
