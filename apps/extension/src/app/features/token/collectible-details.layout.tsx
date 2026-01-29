import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ExternalLinkIcon } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface SectionCardProps {
  title?: string;
  children: ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Stack gap="space.04" bg="ink.background-primary" p="space.05" borderRadius="sm">
      {title && (
        <styled.h2 textStyle="label.02" margin="0">
          {title}
        </styled.h2>
      )}
      {children}
    </Stack>
  );
}

interface RowProps {
  label: string;
  value?: string | null;
  externalLink?: string;
}

export function Row({ label, value, externalLink }: RowProps) {
  if (!value) return null;

  return (
    <Flex justifyContent="space-between" gap="space.04" py="space.02">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      {externalLink ? (
        <styled.button
          type="button"
          display="inline-flex"
          alignItems="center"
          gap="space.01"
          textStyle="caption.02"
          color="ink.action-primary-default"
          _hover={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => openInNewTab(externalLink)}
        >
          {value}
          <ExternalLinkIcon variant="small" />
        </styled.button>
      ) : (
        <styled.span
          textStyle="caption.02"
          textAlign="right"
          overflowWrap="anywhere"
          maxWidth="70%"
        >
          {value}
        </styled.span>
      )}
    </Flex>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
}

export function StatCard({ label, value, subValue }: StatCardProps) {
  return (
    <Box
      bg="ink.background-primary"
      p="space.04"
      borderRadius="sm"
      flex="1"
      display="flex"
      flexDirection="column"
      gap="space.01"
    >
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      <styled.span textStyle="label.01">{value}</styled.span>
      {subValue && (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {subValue}
        </styled.span>
      )}
    </Box>
  );
}
