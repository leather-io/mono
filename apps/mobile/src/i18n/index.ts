import { i18n } from '@lingui/core';

import { DEFAULT_LOCALE, LOCALES } from '../locales';

export function initiateI18n() {
  for (const { locale, messages } of LOCALES) {
    i18n.load(locale, messages);
  }

  i18n.activate(DEFAULT_LOCALE);
}
