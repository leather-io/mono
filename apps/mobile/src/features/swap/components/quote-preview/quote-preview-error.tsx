import { Divider } from '@/components/divider';
import { t } from '@lingui/core/macro';

import { Box, Pressable, Text } from '@leather.io/ui/native';

interface QuoteErrorProps {
  error: Error;
  onRetry(): void;
}

export function QuotePreviewError({ onRetry }: QuoteErrorProps) {
  return (
    <Box backgroundColor="red.background-primary" borderRadius="sm" p="4" gap="2">
      <Text variant="label03">{t`Unable to load the quote`}</Text>
      <Text variant="caption01">{t`This is usually a temporary network or provider-side issue.`}</Text>
      <Divider my="1" />
      <Pressable onPress={onRetry} alignSelf="center" mb="-1">
        <Text variant="label03">{t`Retry`}</Text>
      </Pressable>
    </Box>
  );
}
