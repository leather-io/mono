import { defineQuery } from 'groq';

export const helpCenterCategoriesQuery = defineQuery(`*[
  _type == "helpCenterCategory"
] | order(order asc) {
  _id, name, slug, icon,
  "guideCount": count(*[_type == "helpCenterGuide" && references(^._id)])
}`);

export const helpCenterCategoryBySlugQuery = defineQuery(`*[
  _type == "helpCenterCategory" && slug.current == $slug
][0]{
  _id, name, slug,
  "guides": *[_type == "helpCenterGuide" && category._ref == ^._id] | order(publishedAt desc) {
    _id, title, slug
  }
}`);

export const helpCenterGuideBySlugQuery = defineQuery(`*[
  _type == "helpCenterGuide" && slug.current == $slug
][0]{
  ...,
  category->{ _id, name, slug },
  relatedGuides[]->{ _id, title, slug }
}`);
