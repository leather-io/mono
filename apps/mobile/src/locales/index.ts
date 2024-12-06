import { isFeatureEnabled } from '@/utils/feature-flag';
import OtaClient from '@crowdin/ota-client';
import { i18n } from '@lingui/core';
import { formatter } from '@lingui/format-po';

const prodHash = 'adcc836a66272410c0b94e9twcj'; // with po file format
const devHash = 'a6b025ebb570b783a20df09twcj'; // with po file format
const otaClient = new OtaClient(isFeatureEnabled() ? prodHash : devHash);

export const DEFAULT_LOCALE = 'en';
let LOCALES: string[] = [];
export function getAvailableLocales() {
  return LOCALES;
}

export async function initiateI18n() {
  // run load and activate so the I18nProvider doesn't block the render
  i18n.load('en', {});
  i18n.activate(DEFAULT_LOCALE);

  const translations = await otaClient.getTranslations();

  const form = formatter({ explicitIdAsDefault: true, printLinguiId: true });
  LOCALES = Object.keys(translations);

  Object.keys(translations).map(async locale => {
    const contentFile = translations[locale]?.filter(translation =>
      translation.file.includes('messages.po')
    )[0];
    const rawContent = contentFile?.['content'];
    // @ts-expect-error: Parser requires 2 options but we ain't giving it that luxury
    const parsedContent = await form.parse(rawContent);

    const obj: Record<string, string> = {};
    // run over every key and set translation as a value for that key
    Object.entries(parsedContent).map(translationEntry => {
      obj[translationEntry[0]] = translationEntry[1]['translation'];
    });

    // console.log(obj);

    i18n.load(locale, obj);
  });
}
