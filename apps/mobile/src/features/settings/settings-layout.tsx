import { ReactNode } from 'react';

import { Screen } from '@/components/screen/screen';

import { Text } from '@leather.io/ui/native';

interface SettingsLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function SettingsLayout({ title, children }: SettingsLayoutProps) {
  return (
    <Screen>
      <Screen.Header centerElement={<Text variant="label01">{title}</Text>} />
      <Screen.ScrollView>
        {title ? <Screen.Title>{title}</Screen.Title> : null}
        {children}
      </Screen.ScrollView>
    </Screen>
  );
}
