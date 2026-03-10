import { basicConceptType } from './basic-concept-type';
import { changelogType } from './changelog-type';
import { faqSectionBuilderType } from './faq-section-builder-type';
import { faqType } from './faq-type';
import { helpCenterTypes } from './help-center';
import { learnSectionType } from './learn-section-type';
import { legacyHelpCenterTypes } from './legacy-help-center';
import { postType } from './post-type';
import { sbtcPoolType } from './sbtc-pool-information-type';
import { tagType } from './tag-type';

export const schemaTypes = [
  ...helpCenterTypes,
  ...legacyHelpCenterTypes,
  postType,
  sbtcPoolType,
  faqType,
  faqSectionBuilderType,
  learnSectionType,
  basicConceptType,
  changelogType,
  tagType,
];
