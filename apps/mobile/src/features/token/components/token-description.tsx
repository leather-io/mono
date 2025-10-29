import { useState } from 'react';

import { t } from '@lingui/core/macro';

import { Box, ChevronDownIcon, ChevronUpIcon, Text, TouchableOpacity } from '@leather.io/ui/native';

import { TokenDetailsCard } from './token-details-card';

interface TokenDescriptionProps {
  description: string;
  previewLength?: number;
}
export function TokenDescription({ description, previewLength = 100 }: TokenDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > previewLength;
  const displayText =
    isExpanded || !shouldTruncate ? description : description.slice(0, previewLength) + '...';
  return (
    <TokenDetailsCard title={t`Description`}>
      <Text variant="caption01">{displayText}</Text>

      {shouldTruncate && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Box flexDirection="row" alignItems="center" gap="1" py="2">
            <Text variant="label02">{isExpanded ? t`Read less` : t`Read more`}</Text>
            {isExpanded ? <ChevronUpIcon variant="small" /> : <ChevronDownIcon variant="small" />}
          </Box>
        </TouchableOpacity>
      )}
    </TokenDetailsCard>
  );
}
