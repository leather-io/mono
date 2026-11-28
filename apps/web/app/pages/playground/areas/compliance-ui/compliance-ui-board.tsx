import { type ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

// Board / Section helpers, following staking-states/staking-surface.tsx: a section is a
// heading and description over one or more boards; a board is a labelled, bordered group.

interface SectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}
export function Section({ id, title, description, children }: SectionProps) {
  return (
    <styled.section id={id} scrollMarginTop="space.07" data-testid={`compliance-ui-${id}`}>
      <Stack gap="space.06">
        <Stack gap="space.02" maxWidth="70ch">
          <styled.h2 textStyle="heading.04">{title}</styled.h2>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            {description}
          </styled.p>
        </Stack>
        {children}
      </Stack>
    </styled.section>
  );
}

interface BoardProps {
  label: string;
  note?: string;
  children: ReactNode;
}
export function Board({ label, note, children }: BoardProps) {
  return (
    <Stack gap="space.03">
      <Stack gap="space.01" maxWidth="70ch">
        <styled.h3 textStyle="label.02">{label}</styled.h3>
        {note ? (
          <styled.p
            textStyle="caption.01"
            color="ink.text-subdued"
            borderLeft="default"
            pl="space.03"
          >
            {note}
          </styled.p>
        ) : null}
      </Stack>
      <Box
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="md"
        px="space.05"
        py="space.05"
        overflowX="auto"
      >
        <Flex gap="space.07" alignItems="flex-start" flexWrap="wrap">
          {children}
        </Flex>
      </Box>
    </Stack>
  );
}

interface VariantProps {
  label: string;
  surface: string;
  caption?: string;
  children: ReactNode;
}
// One screen on the board: its variant name and surface above the frame.
export function Variant({ label, surface, caption, children }: VariantProps) {
  return (
    <Stack gap="space.03" flexShrink={0} data-testid="compliance-ui-variant">
      <Stack gap="space.00" maxWidth="390px">
        <styled.h4 textStyle="label.02">{label}</styled.h4>
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {surface}
        </styled.span>
        {caption ? (
          <styled.span textStyle="caption.01" color="ink.text-secondary" pt="space.01">
            {caption}
          </styled.span>
        ) : null}
      </Stack>
      {children}
    </Stack>
  );
}
