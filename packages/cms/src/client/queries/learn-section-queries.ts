import { defineQuery } from 'groq';

export const extensionTokensLearnSectionQuery = defineQuery(`*[
  _type == "learnSection"
  && key == "extension-tokens"
][0]{
  key,
  items[]{ label, iconKey, linkType, guideSlug, externalUrl }
}`);

export const extensionCollectiblesLearnSectionQuery = defineQuery(`*[
  _type == "learnSection"
  && key == "extension-collectibles"
][0]{
  key,
  items[]{ label, iconKey, linkType, guideSlug, externalUrl }
}`);

export const mobileHomeLearnSectionQuery = defineQuery(`*[
  _type == "learnSection"
  && key == "mobile-home"
][0]{
  key,
  items[]{ label, iconKey, linkType, guideSlug, externalUrl }
}`);
