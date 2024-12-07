import { isFeatureEnabled } from '@/utils/feature-flag';
import OtaClient from '@crowdin/ota-client';
import { i18n } from '@lingui/core';
import { formatter } from '@lingui/format-po';

const prodHash = 'adcc836a66272410c0b94e9twcj'; // with po file format
const devHash = 'a6b025ebb570b783a20df09twcj'; // with po file format
const otaClient = new OtaClient(isFeatureEnabled() ? devHash : prodHash);

export const DEFAULT_LOCALE = 'en';
let LOCALES: string[] = [];
export function getAvailableLocales() {
  return LOCALES;
}

const placeholderRegex = /[.]*{([^{}]*)}[.]*/g;

type StringWithPlaceholders = (string | string[])[];
// TODO: really not something we should be doing. We are practically parsing po files ourselves
// and i don't want it to be our job. Maybe we need to just ditch po format altogether and just use json.
// Anyway, works for now but let's get back to it asap
function matchPlaceholders(translation: string): StringWithPlaceholders {
  const normalizedTranslation = translation.replace(placeholderRegex, '{{placeholder}}');
  const matches = translation.match(placeholderRegex)?.map(str => str.substring(1, str.length - 1));
  const splittedTranslation = normalizedTranslation.split('{{placeholder}}');
  const arr: (string | string[])[] = [];
  for (let i = 0; i < splittedTranslation.length; ++i) {
    const t = splittedTranslation[i];
    const m = matches?.[i];
    if (t) {
      arr.push(t);
    }
    if (m) {
      arr.push([m]);
    }
  }
  return arr;
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

    const obj: Record<string, string | StringWithPlaceholders> = {};

    // run over every key and set translation as a value for that key
    Object.entries(parsedContent).map(translationEntry => {
      const key = translationEntry[0];
      const translation = translationEntry[1]['translation'];

      if (placeholderRegex.test(translation)) {
        obj[key] = matchPlaceholders(translation);
      } else {
        obj[key] = translation;
      }
    });
    // @ts-expect-error a slightly wrong type but it's ok
    i18n.load(locale, obj);
  });
}
