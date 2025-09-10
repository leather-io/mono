import { defineQuery } from 'groq';

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
