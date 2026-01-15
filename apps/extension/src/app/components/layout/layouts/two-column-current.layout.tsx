import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

interface DescriptionColumnProps {
  title: string;
  description: string;
}
export function DescriptionColumn({ title, description }: DescriptionColumnProps) {
  return (
    <Stack gap="space.05">
      <styled.h1 textStyle="heading.03">{title}</styled.h1>
      <styled.p textStyle="body.01">{description}</styled.p>
    </Stack>
  );
}

interface TwoColumnLayoutProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function TwoColumnLayout({ leftColumn, rightColumn }: TwoColumnLayoutProps) {
  return (
    <Flex
      flexDirection={['column', 'column', 'row']}
      pt={[0, 'space.03', 'space.06']}
      px="space.05"
      gap="space.05"
      width="100%"
      justifyContent="space-between"
    >
      <Flex maxWidth={[null, null, '1/3']} flexDirection="column" gap="space.04">
        {leftColumn}
      </Flex>

      <Flex flexGrow={1} gap="space.05" flexDirection="column" mb={['space.05', null, '0']}>
        {rightColumn}
      </Flex>
    </Flex>
  );
}
