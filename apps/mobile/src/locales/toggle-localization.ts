import { getAvailableLocales } from '@/locales';
import { i18n } from '@lingui/core';

export function toggleLocalization() {
  const locales = getAvailableLocales();
  const locIdx = locales.findIndex(loc => loc === i18n.locale);
  const isLastItem = locIdx === locales.length - 1;
  const nextIdx = isLastItem ? 0 : locIdx + 1;
  const nextLocale = locales[nextIdx];
  if (!nextLocale) {
    throw new Error("Didn't find next locale for some reason");
  }
  i18n.activate(nextLocale);
}
