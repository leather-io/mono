import { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

interface TwoColumnLayoutProps {
  title: ReactNode;
  content: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  wideChild?: boolean;
}

/**
 * @deprecated use TwoColumnLayout from two-column-current.layout.tsx
 */
export function TwoColumnLayout({
  title,
  content,
  action,
  children,
  wideChild,
}: TwoColumnLayoutProps): React.JSX.Element {
  return (
    <Flex
      flexDirection={['column', null, 'row']}
      pt="space.06"
      px={['space.05', null, 'space.00']}
      mx={['auto', null, 'space.03', 'space.06']}
      gap="space.05"
      width={['100vw', null, 'unset']}
    >
      <Flex flexDirection="column" gap="space.04">
        <Stack gap="space.04">
          <styled.h1 textStyle="heading.03">{title}</styled.h1>
          <styled.p textStyle="label.02">{content}</styled.p>
          <Box mt="space.04">{action}</Box>
        </Stack>
      </Flex>

      <Flex gap="space.05" flexDirection="column" mb={['space.05', null, '0']}>
        <Stack
          p={['space.02', null, 'space.05']}
          gap="space.04"
          bg="ink.background-primary"
          border="default"
          borderRadius="lg"
          width="100%"
          minWidth={['100%', null, '400px', wideChild ? 'twoColumnPageWidth' : 'pageWidth']}
          flex="1"
        >
          {children}
        </Stack>
      </Flex>
    </Flex>
  );
}
