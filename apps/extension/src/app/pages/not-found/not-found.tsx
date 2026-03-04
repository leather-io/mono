import { useNavigate } from 'react-router';

import LostInStackImg from '@assets/images/lost-in-stack.png';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { isPopupMode } from '@app/common/utils';
import { Content } from '@app/components/layout';
import { HomeHeader } from '@app/features/container/headers/home.header';

interface NotFoundContentProps {
  onGoHome(): void;
}

export function NotFoundContent({ onGoHome }: NotFoundContentProps) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      py="space.09"
      px="space.05"
      gap="space.05"
      width="100%"
    >
      <styled.img src={LostInStackImg} width="200px" height="200px" alt="Lost in the stack" />
      <Stack gap="space.02" alignItems="center" maxWidth="340px">
        <styled.h2 textStyle="heading.04" data-testid="not-found-heading">
          Lost in the stack
        </styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued-secondary" textAlign="center">
          We could not find what you're looking for. The link you clicked may be broken or the page
          may have been removed.
        </styled.p>
      </Stack>
      <Button onClick={onGoHome} fullWidth maxWidth="340px" data-testid="not-found-go-home-btn">
        Go home
      </Button>
    </Flex>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const isPopup = isPopupMode();

  function handleGoHome() {
    void navigate(RouteUrls.Home);
  }

  if (isPopup) {
    return (
      <Content>
        <Stack width="100%" flex={1}>
          <NotFoundContent onGoHome={handleGoHome} />
        </Stack>
      </Content>
    );
  }

  return (
    <>
      <HomeHeader />
      <Content>
        <Stack width="100%" flex={1} alignItems="center" justifyContent="center">
          <NotFoundContent onGoHome={handleGoHome} />
        </Stack>
      </Content>
    </>
  );
}
