import { defineQuery } from 'groq';

export const legacyHelpCenterPageQuery = defineQuery(`*[
  _type == "legacyHelpCenterPage"
] {
  categories[]->{
    _id,
    categoryName,
    slug,
    icon,
    "guideCount": count(guides)
  }
}[0]`);

export const legacyHelpCenterCategoryBySlugQuery = defineQuery(`*[
  _type == "legacyHelpCenterCategory" && slug.current == $slug
][0]{
  _id,
  categoryName,
  slug,
  guides[]->{
    ...
  }
}`);
