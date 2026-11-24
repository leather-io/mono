import { DEFAULT_PRIVACY_MASK } from '@/shared/constants';
import { usePrivacyMode } from '@/store/settings/settings.read';

import { Text, type TextProps } from '@leather.io/ui/native';

interface PrivateTextProps extends TextProps {
  mask?: string;
}
export function PrivateText({ children, mask = DEFAULT_PRIVACY_MASK, ...props }: PrivateTextProps) {
  const isPrivate = usePrivacyMode();
  return <Text {...props}>{isPrivate ? mask : children}</Text>;
}
