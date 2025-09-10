import { basicConceptType } from './basic-concept-type';
import { faqSectionBuilderType } from './faq-section-builder-type';
import { faqType } from './faq-type';
import { legacyHelpCenterTypes } from './legacy-help-center';
import { postType } from './post-type';
import { sbtcPoolType } from './sbtc-pool-information-type';

export const schemaTypes = [
  postType,
  sbtcPoolType,
  faqType,
  faqSectionBuilderType,
  basicConceptType,
  ...legacyHelpCenterTypes,
];
