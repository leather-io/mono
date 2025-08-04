import { i18n } from '@lingui/core';

const DEFAULT_LOCALE = 'en';

export async function initiateI18n() {
  // run load and activate so the I18nProvider doesn't block the render
  const { messages } = await import(`./locales/en/messages`);
  i18n.load(DEFAULT_LOCALE, messages);
  i18n.activate(DEFAULT_LOCALE);
}
