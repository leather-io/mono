import { useNavigate } from 'react-router';

import LostInStackImg from '@assets/images/lost-in-stack.png';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { Content } from '@app/components/layout';

import { TokenDetailsHeader } from './components/token-details-header';

interface TokenDetailsErrorProps {
  title?: string;
  onRetry?(): void;
}

export function TokenDetailsError({ title = 'Token', onRetry }: TokenDetailsErrorProps) {
  const navigate = useNavigate();

  return (
    <Content>
      <Stack width="100%" gap="space.00" data-testid="token-details-error">
        <TokenDetailsHeader title={title} />
        <Box width="100%" maxWidth={['100%', null, '780px']} margin="0 auto">
          <Stack bg="ink.background-secondary" borderRadius={['0', null, 'md']} overflow="hidden">
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              py="space.09"
              px="space.05"
              gap="space.05"
              bg="ink.background-primary"
            >
              <styled.img
                src={LostInStackImg}
                width="200px"
                height="200px"
                alt="Lost in the stack"
              />
              <Stack gap="space.02" alignItems="center" maxWidth="340px">
                <styled.h2 textStyle="heading.04">Lost in the stack</styled.h2>
                <styled.p textStyle="body.02" color="ink.text-subdued-secondary" textAlign="center">
                  We could not find what you're looking for. The link you clicked may be broken or
                  the page may have been removed.
                </styled.p>
              </Stack>
              <Button fullWidth maxWidth="340px" onClick={onRetry ?? (() => navigate(-1))}>
                Go back
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Stack>
    </Content>
  );
}
