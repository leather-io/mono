import { defineQuery } from 'groq';

export const legacyGetStartedGuides = defineQuery(`{
  "getStartedGuides": *[ 
    _id == "417c80eb-4fd6-436a-a8d3-2f53acdda714"
  ] {
      groupTitle,
      sections[]->{
        slug,
        sectionTitle,
        _id,        
        sectionCategories[]{
          _id,
          categoryTitle,
          categoryPosts[]->{
            ...
          }
        }
    }
  }[0]
}`);

export const legacyGuidesSectionPostsQuery = defineQuery(`{
    "section": *[
        _type == "legacyGuideSection"
        && slug.current == $slug
    ][0],
    "posts": *[
        _type == "legacyGuideSection"
        && slug.current == $slug
    ].sectionCategories[].categoryPosts[]->{...}
}`);

export const legacyGuideBySlugQuery = defineQuery(`*[
  _type == "post" && slug.current == $slug
][0]{
  ...,
  relatedPosts[]->{
    _id,
    title,
    slug
  }
}`);
