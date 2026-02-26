import { defineQuery } from 'groq';

export const helpCenterCategoriesQuery = defineQuery(`*[
  _type == "helpCenterCategory"
] | order(order asc) {
  _id, "categoryName": name, slug, icon,
  guides[]->{ _id, title, slug }
}`);

export const helpCenterCategoryBySlugQuery = defineQuery(`*[
  _type == "helpCenterCategory" && slug.current == $slug
][0]{
  _id, name, slug,
  guides[]->{ _id, title, slug }
}`);

export const helpCenterGuideBySlugQuery = defineQuery(`*[
  _type == "helpCenterGuide" && slug.current == $slug
][0]{
  ...,
  "categories": *[_type == "helpCenterCategory" && ^._id in guides[]._ref]{ _id, name, slug },
  relatedGuides[]->{ _id, title, slug }
}`);

export const helpCenterGuideSearchQuery = defineQuery(`*[
  _type == "helpCenterGuide" && [title, body] match $query + "*"
] | score(
  boost(title match $query + "*", 3),
  pt::text(body) match $query + "*"
) | order(_score desc)[0...10] {
  _id, title, slug,
  "categories": *[_type == "helpCenterCategory" && ^._id in guides[]._ref]{ _id, name, slug }
}`);
