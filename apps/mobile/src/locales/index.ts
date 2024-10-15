import OtaClient from '@crowdin/ota-client';
import { i18n } from '@lingui/core';

const otaClient = new OtaClient('fa04f606d6ca277403b4e49twcj');

export const DEFAULT_LOCALE = 'en';
let LOCALES: string[] = [];
export function getAvailableLocales() {
  return LOCALES;
}

export async function initiateI18n() {
  // run load and activate so the I18nProvider doesn't block the render
  i18n.load('en', {});
  i18n.activate(DEFAULT_LOCALE);

  const content = await otaClient.getStrings();

  LOCALES = Object.keys(content);

  Object.keys(content).map(locale => {
    i18n.load(locale, content[locale]);
  });
}
