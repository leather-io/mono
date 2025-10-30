import { Linking } from 'react-native';

import { ArrowTopRightIcon, Box, Pressable, Text } from '@leather.io/ui/native';

interface ExternalLinkProps {
  url: string;
  label: string;
}
export function ExternalLink({ url, label }: ExternalLinkProps) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      {({ pressed }) => (
        <Box flexDirection="row" alignItems="center" gap="1">
          <ArrowTopRightIcon color="ink.text-subdued" variant="small" />
          <Text
            variant="label02"
            textDecorationLine="underline"
            textDecorationColor="ink.text-subdued"
            opacity={pressed ? 0.5 : 1}
          >
            {label}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
