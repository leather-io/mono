import { Box, type BoxProps } from '@leather.io/ui/native';

export function SettingsList(props: BoxProps) {
  return <Box gap="3" mx="-5" {...props} accessibilityRole="list" />;
}
