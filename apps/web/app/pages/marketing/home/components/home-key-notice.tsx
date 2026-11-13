import { useLocation } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';
import { TARGET } from '~/constants/environment';

import { ErrorTriangleIcon } from '@leather.io/ui';

export function HomeKeyNotice() {
  const { search } = useLocation();
  const requestedVariant =
    TARGET === 'production' ? null : new URLSearchParams(search).get('keyNotice');
  const variant =
    requestedVariant === 'outline' || requestedVariant === 'plain' ? requestedVariant : 'soft';

  return (
    <Flex
      role="note"
      aria-label="Wallet security"
      width="fit-content"
      alignItems="center"
      gap="space.02"
      bg={variant === 'soft' ? 'ink.background-secondary' : undefined}
      border={variant === 'outline' ? 'default' : undefined}
      borderRadius="sm"
      px={variant === 'plain' ? '0' : 'space.03'}
      py="space.02"
      textStyle="caption.01"
      color="ink.text-primary"
    >
      <Flex flexShrink={0} aria-hidden>
        <ErrorTriangleIcon variant="small" />
      </Flex>
      <styled.p>Back up your Secret Key. Never share it.</styled.p>
    </Flex>
  );
}
