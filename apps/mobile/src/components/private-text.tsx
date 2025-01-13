import { usePrivacyMode } from '@/store/settings/settings.read';

import { Text, TextProps } from '@leather.io/ui/native';

const defaultMask = '***';

interface PrivateTextProps extends TextProps {
  mask?: string;
}
export function PrivateText({ children, mask = defaultMask, ...props }: PrivateTextProps) {
  const isPrivate = usePrivacyMode();
  return <Text {...props}>{isPrivate ? mask : children}</Text>;
}
