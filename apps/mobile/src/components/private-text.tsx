import { Pressable } from 'react-native';

import { useSettings } from '@/store/settings/settings';
import { usePrivacyMode } from '@/store/settings/settings.read';
import { HasChildren } from '@/utils/types';

import { Text, TextProps } from '@leather.io/ui/native';

const defaultPrivateText = '***';

interface PrivateTextProps extends HasChildren {
  customPrivateText?: string;
}
export function PrivateText({
  children,
  customPrivateText,
  ...props
}: PrivateTextProps & TextProps) {
  const { changePrivacyModePreference, privacyModePreference } = useSettings();
  const isPrivate = usePrivacyMode();

  function onTogglePrivacyMode() {
    changePrivacyModePreference(privacyModePreference === 'visible' ? 'hidden' : 'visible');
  }

  return (
    <Pressable onPress={() => onTogglePrivacyMode()}>
      {isPrivate ? (
        <Text {...props}>{customPrivateText ?? defaultPrivateText}</Text>
      ) : (
        <Text {...props}>{children}</Text>
      )}
    </Pressable>
  );
}
