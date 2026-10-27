// Quiet chrome for the info rail's sections (concept, notes, inspiration, how
// we got here). Canvas-only, never inside a screen.
import { type ReactNode, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon, ChevronRightIcon } from '@leather.io/ui';

// Small column label used inside sections ("The bet", "Why", …).
export function ColumnLabel({ children }: { children: ReactNode }) {
  return (
    <styled.span textStyle="label.03" color="ink.text-secondary">
      {children}
    </styled.span>
  );
}

// Provenance tag after a line: "notes", "brief §4", "our read".
export function SourceTag({ children }: { children: string }) {
  return (
    <styled.span textStyle="caption.02" color="ink.text-subdued" whiteSpace="nowrap">
      {children}
    </styled.span>
  );
}

interface RailDisclosureProps {
  title: string;
  meta?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

// A section of the right rail: a full-width heading that opens and closes,
// separated from the next by a hairline. Keyboard: the summary is a button.
export function RailDisclosure({
  title,
  meta,
  defaultOpen = false,
  children,
}: RailDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = open ? ChevronDownIcon : ChevronRightIcon;
  return (
    <styled.details
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
      borderBottomWidth={1}
      borderBottomStyle="solid"
      borderColor="ink.border-default"
    >
      <styled.summary
        listStyle="none"
        cursor="pointer"
        px="space.04"
        py="space.03"
        _hover={{ bg: 'ink.component-background-hover' }}
        _focusVisible={{ outline: 'focus', outlineOffset: '-2px' }}
        css={{ '&::-webkit-details-marker': { display: 'none' } }}
      >
        <Flex gap="space.02" alignItems="center" justifyContent="space-between">
          <Stack gap="0" minWidth="0">
            <styled.span textStyle="label.02" color="ink.text-primary">
              {title}
            </styled.span>
            {meta ? (
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {meta}
              </styled.span>
            ) : null}
          </Stack>
          <Box color="ink.text-subdued" flexShrink={0}>
            <Icon variant="small" />
          </Box>
        </Flex>
      </styled.summary>
      <Box px="space.04" pb="space.05" pt="space.01">
        {children}
      </Box>
    </styled.details>
  );
}
