import { defineQuery } from 'groq';

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
faqBuilder[]{
    _key,
    ...@->{
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

export const sbtcPoolsQuery = defineQuery(`*[
  _type == "sbtcPool"
  && id != "basic"
] | order(apr desc)`);
