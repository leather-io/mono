import { findBestLanguageTag } from 'react-native-localize';

import { defaultLanguage, supportedLanguages } from '@/i18n/languages';
import { keys } from 'remeda';

function detectSystemLanguage() {
  const supportedLanguageCodes = keys(supportedLanguages);
  return findBestLanguageTag(supportedLanguageCodes)?.languageTag;
}

export function detectLanguage() {
  return detectSystemLanguage() ?? defaultLanguage;
}
