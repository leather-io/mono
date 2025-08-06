import { defaultLanguage } from '@/i18n/languages';
import { i18n } from '@lingui/core';

export async function initiateI18n() {
  // run load and activate so the I18nProvider doesn't block the render
  const { messages } = await import(`./locales/en/messages`);
  i18n.load(defaultLanguage, messages);
  i18n.activate(defaultLanguage);
}
