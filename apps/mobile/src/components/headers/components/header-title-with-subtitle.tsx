import { Stack, Text } from '@leather.io/ui/native';

interface HeaderTitleWithSubtitleProps {
  title: string;
  subtitle: string;
  testID?: string;
}
export function HeaderTitleWithSubtitle({ title, subtitle, testID }: HeaderTitleWithSubtitleProps) {
  return (
    <Stack alignItems="center" justifyContent="center">
      <Text variant="heading05" color="ink.text-primary" testID={testID}>
        {title}
      </Text>
      <Text variant="label03" color="ink.text-subdued">
        {subtitle}
      </Text>
    </Stack>
  );
}
