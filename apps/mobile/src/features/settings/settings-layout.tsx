import { ReactNode } from 'react';

import { Screen } from '@/components/screen/screen';

interface SettingsLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function SettingsLayout({ title, children }: SettingsLayoutProps) {
  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        {title ? <Screen.Title>{title}</Screen.Title> : null}
        {children}
      </Screen.ScrollView>
    </Screen>
  );
}
