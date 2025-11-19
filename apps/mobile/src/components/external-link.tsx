import { Linking } from 'react-native';

import { ArrowTopRightIcon, Box, Pressable, Text } from '@leather.io/ui/native';

interface LabelProps {
  label: string;
  opacity?: number;
}
function Label({ label, opacity = 1 }: LabelProps) {
  return (
    <Text
      variant="label02"
      textDecorationLine="underline"
      textDecorationColor="ink.text-subdued"
      opacity={opacity}
    >
      {label}
    </Text>
  );
}
interface ExternalLinkProps {
  url: string | undefined;
  label: string;
}
export function ExternalLink({ url, label }: ExternalLinkProps) {
  return (
    <Pressable onPress={() => Linking.openURL(url || '')}>
      {({ pressed }) => (
        <Box flexDirection="row" alignItems="center" gap="1">
          <ArrowTopRightIcon color="ink.text-subdued" variant="small" />
          <Label label={label} opacity={pressed ? 0.5 : 1} />
        </Box>
      )}
    </Pressable>
  );
}
