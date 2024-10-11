import OtaClient from '@crowdin/ota-client';
import { i18n } from '@lingui/core';

const otaClient = new OtaClient('fa04f606d6ca277403b4e49twcj');

export const DEFAULT_LOCALE = 'en';
let LOCALES: string[] = [];
export function getAvailableLocales() {
  return LOCALES;
}

export async function initiateI18n() {
  const content = await otaClient.getStrings();

  LOCALES = Object.keys(content);

  Object.keys(content).map(locale => {
    i18n.load(locale, content[locale]);
  });

  i18n.activate(DEFAULT_LOCALE);
}
