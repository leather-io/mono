import { useSettings } from '@/store/settings/settings';

import { type HasChildren, HapticsProvider as LeatherHapticsProvider } from '@leather.io/ui/native';

export function HapticsProvider({ children }: HasChildren) {
  const { hapticsPreference } = useSettings();

  return (
    <LeatherHapticsProvider enabled={hapticsPreference === 'enabled'}>
      {children}
    </LeatherHapticsProvider>
  );
}
