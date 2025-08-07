import { ReactNode, useState } from 'react';

import { loadLanguageData } from '@/i18n/load-language-data';
import { useSettings } from '@/store/settings/settings';
import { i18n } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { captureException } from '@sentry/react-native';

import { useOnMount } from '@leather.io/ui/native';

function useI18Initialization() {
  const [ready, setReady] = useState(false);
  const { languagePreference } = useSettings();

  useOnMount(() => {
    loadLanguageData(languagePreference)
      .then(([{ messages }]) => {
        i18n.loadAndActivate({ locale: languagePreference, messages });
        setReady(true);
      })
      .catch(error => {
        captureException(error, {
          extra: { context: 'i18n initialization', languagePreference },
        });
      });
  });

  return { ready };
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { ready } = useI18Initialization();

  if (!ready) return null;

  return <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>;
}
