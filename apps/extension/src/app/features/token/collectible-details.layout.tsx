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
    <Stack bg="ink.background-primary" py="space.03" gap="space.00">
      <Box mx="space.05" borderTopWidth="1px" borderColor="ink.border-default" />
      {title && (
        <Flex px="space.05" py="space.02" alignItems="center" height="40px">
          <styled.h2 textStyle="label.03" margin="0">
            {title}
          </styled.h2>
        </Flex>
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
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap="space.04"
      px="space.05"
      py="space.01"
      minHeight="30px"
    >
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
