import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

interface SectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <Stack gap="space.06">
      <Stack gap="space.02" maxWidth="70ch">
        <styled.h2 textStyle="heading.04">{title}</styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {description}
        </styled.p>
      </Stack>
      <Flex gap="space.07" flexWrap="wrap" alignItems="flex-start">
        {children}
      </Flex>
    </Stack>
  );
}

interface BoardProps {
  label: string;
  note: string;
  children: ReactNode;
}

export function Board({ label, note, children }: BoardProps) {
  return (
    <Stack gap="space.03" width="popupWidth">
      <Stack gap="space.01">
        <styled.h3 textStyle="label.02">{label}</styled.h3>
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          borderLeft="default"
          pl="space.03"
        >
          {note}
        </styled.p>
      </Stack>
      {children}
    </Stack>
  );
}
