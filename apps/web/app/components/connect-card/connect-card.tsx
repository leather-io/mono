import type { ReactNode } from 'react';

import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';

import { Flag } from '@leather.io/ui';

interface ConnectCardProps extends BoxProps {
  title: ReactNode;
  description: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

// Shared "Get started with Leather" connect overlay card. Pure layout: the
// floating card chrome, the Leather logo header, and a column of action rows.
// Callers own positioning (fixed overlay vs in-flow) and the rows' connect
// behavior.
export function ConnectCard({ title, description, footer, children, ...props }: ConnectCardProps) {
  return (
    <Box
      bg="ink.background-primary"
      p="space.06"
      borderRadius="md"
      boxShadow="0 0 2px 0 rgba(18, 16, 15, 0.12), 0 4px 8px 0 rgba(18, 16, 15, 0.08), 0 12px 24px 0 rgba(18, 16, 15, 0.08)"
      animationName="slideUpAndFade"
      animationDuration="800ms"
      animationTimingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
      animationDelay="240ms"
      animationFillMode="both"
      opacity="0"
      transform="translateY(20px)"
      {...props}
    >
      <Flag
        spacing="space.05"
        img={<styled.img src="/images/connect-logo.svg" alt="Leather logo" />}
      >
        <styled.h2 textStyle="heading.05">{title}</styled.h2>
        <styled.p textStyle="body.02">{description}</styled.p>
      </Flag>
      <Box mt="space.05" textStyle="label.01">
        <Flex direction="column" gap="space.04">
          {children}
        </Flex>
      </Box>
      {footer}
    </Box>
  );
}

interface ConnectActionRowProps extends BoxProps {
  img: ReactNode;
  title: ReactNode;
  description: ReactNode;
  trailing: ReactNode;
  error?: ReactNode;
  hideBodyBelowSm?: boolean;
}

// One pill row inside a ConnectCard: leading icon, title + description, and a
// trailing slot (a connect button, or a status badge + sign-out).
export function ConnectActionRow({
  img,
  title,
  description,
  trailing,
  error,
  hideBodyBelowSm = false,
  ...props
}: ConnectActionRowProps) {
  return (
    <Box {...props}>
      <Flag
        img={<Box ml="space.03">{img}</Box>}
        border="default"
        borderRadius="99px"
        width="100%"
        py="space.03"
      >
        <Flag
          width="100%"
          reverse
          img={
            <Box mr="space.03" ml={[null, 'space.04']}>
              {trailing}
            </Box>
          }
        >
          <Box display={hideBodyBelowSm ? ['none', 'block'] : 'block'}>
            {title}
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {description}
            </styled.p>
          </Box>
        </Flag>
      </Flag>
      {error}
    </Box>
  );
}
