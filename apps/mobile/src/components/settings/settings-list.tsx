import { Box, type BoxProps } from '@leather.io/ui/native';

export function SettingsList(props: BoxProps) {
  return <Box gap="3" {...props} accessibilityRole="list" />;
}
