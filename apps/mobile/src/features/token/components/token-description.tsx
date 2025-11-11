import { useState } from 'react';

import { t } from '@lingui/core/macro';

import {
  Box,
  ChevronDownIcon,
  ChevronUpIcon,
  SkeletonLoader,
  Text,
  TouchableOpacity,
} from '@leather.io/ui/native';

import { TokenDetailsCard } from './token-details-card';

interface TokenDescriptionProps {
  description?: string | null;
  previewLength?: number;
  isLoading?: boolean;
}
export function TokenDescription({
  description,
  previewLength = 100,
  isLoading = false,
}: TokenDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (isLoading) {
    return (
      <TokenDetailsCard title={t`Description`}>
        <TokenDescriptionLoading />
      </TokenDetailsCard>
    );
  }

  if (!description) {
    return null;
  }
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

export function TokenDescriptionLoading() {
  return (
    <Box flexDirection="column" gap="1">
      <Box flexDirection="row" gap="1">
        <SkeletonLoader height={10} maxWidth={60} isLoading />
        <SkeletonLoader height={10} maxWidth={146} isLoading />
        <SkeletonLoader height={10} maxWidth={58} isLoading />
      </Box>
      <Box flexDirection="row" gap="1">
        <SkeletonLoader height={10} maxWidth={35} isLoading />
        <SkeletonLoader height={10} maxWidth={77} isLoading />
        <SkeletonLoader height={10} maxWidth={112} isLoading />
        <SkeletonLoader height={10} maxWidth={58} isLoading />
      </Box>
      <Box flexDirection="row" alignItems="center" gap="1">
        <SkeletonLoader height={10} maxWidth={60} isLoading />
        <SkeletonLoader height={10} maxWidth={85} isLoading />
      </Box>
    </Box>
  );
}
