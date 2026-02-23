import { defineQuery } from 'groq';

export const helpCenterCategoriesQuery = defineQuery(`*[
  _type == "helpCenterCategory"
] | order(order asc) {
  _id, name, slug, icon,
  "guideCount": count(*[_type == "helpCenterGuide" && ^._id in categories[]._ref])
}`);

export const helpCenterCategoryBySlugQuery = defineQuery(`*[
  _type == "helpCenterCategory" && slug.current == $slug
][0]{
  _id, name, slug,
  "guides": *[_type == "helpCenterGuide" && ^._id in categories[]._ref] | order(publishedAt desc) {
    _id, title, slug
  }
}`);

export const helpCenterGuideBySlugQuery = defineQuery(`*[
  _type == "helpCenterGuide" && slug.current == $slug
][0]{
  ...,
  categories[]->{ _id, name, slug },
  relatedGuides[]->{ _id, title, slug }
}`);
