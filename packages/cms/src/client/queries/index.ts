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
  && id != "basic"
] | order(apr desc)`);

export const sbtcBasicEnrollQuery = defineQuery(`*[
  _type == "sbtcPool"
  && id == "basic"
][0]`);

export const sbtcFaqQuery = defineQuery(`*[
  _type == "faqSection"
  && category == "sbtc"
]{
  title,
  category,
  faqBuilder[]->{
    _id,
    _type,
    question,
    answer,
    tags,
    legacyPost->{
      _id,
      slug
    }
  }
}[0]`);

export const allBasicConceptsQuery = defineQuery(`*[
  _type == "basicConcept"
]{
  ...,
  relatedLegacyPost->{
    slug
  }
} | order(name asc)`);

export const tvlConceptQuery = defineQuery(`*[
  _type == "basicConcept"
  && slug.current == "total-value-locked"
]{
  ...,
  relatedLegacyPost->{
    slug
  }
}[0]`);

export const sbtcConceptsQuery = defineQuery(`{
  "historicalYield": *[
    _type == "basicConcept"
    && slug.current == "historical-yield"
  ]{
    name,
    description,
    relatedLegacyPost->{
      slug
    }
  }[0],
  "minimumCommitment": *[
    _type == "basicConcept"
    && slug.current == "minimum-commitment"
  ]{
    name,
    description,
    relatedLegacyPost->{
      slug
    }
  }[0],
  "rewardsToken": *[
    _type == "basicConcept"
    && slug.current == "rewards-token"
  ]{
    name,
    description,
    relatedLegacyPost->{
      slug
    }
  }[0],
  "tvl": *[
    _type == "basicConcept"
    && slug.current == "total-value-locked"
  ]{
    name,
    description,
    relatedLegacyPost->{
      slug
    }
  }[0]
}`);

export const legacyGuidesQuery = defineQuery(`{
  "legacyGuides": *[ 
    _id == "417c80eb-4fd6-436a-a8d3-2f53acdda714"
  ] {
      sections[]->{
        "title": sectionTitle,
        _id,        
        "categories": sectionCategories[]{
          _id,
          "title": categoryTitle,
          "posts": categoryPosts[]->{
            ...
          }
        }
    }
  }[0]
}`);

export const legacyGuideBySlugQuery = defineQuery(`*[
  _type == "post" && slug.current == $slug
][0]`);
