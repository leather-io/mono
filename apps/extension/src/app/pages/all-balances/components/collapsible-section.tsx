import { type ReactNode, useState } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon, ChevronUpIcon } from '@leather.io/ui';

interface CollapsibleSectionProps {
  header: ReactNode;
  collapsedSummary?: ReactNode;
  subheader?: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
  dataTestId?: string;
}

export function CollapsibleSection({
  header,
  collapsedSummary,
  subheader,
  defaultExpanded = true,
  children,
  dataTestId,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Stack gap="space.03" py="space.04" data-testid={dataTestId}>
      <styled.button
        type="button"
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap="space.01"
        width="100%"
        textAlign="left"
        cursor="pointer"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(value => !value)}
      >
        <Flex alignItems="center" justifyContent="space-between" gap="space.02">
          <Flex alignItems="center" gap="space.02" minWidth={0}>
            {header}
          </Flex>
          <Flex alignItems="center" gap="space.02" flexShrink={0}>
            {!isExpanded && collapsedSummary}
            {isExpanded ? (
              <ChevronUpIcon variant="small" color="ink.action-primary-default" />
            ) : (
              <ChevronDownIcon variant="small" color="ink.action-primary-default" />
            )}
          </Flex>
        </Flex>
        {subheader}
      </styled.button>
      {isExpanded && children}
    </Stack>
  );
}
