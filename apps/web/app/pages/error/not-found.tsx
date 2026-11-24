import { Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { HelpCards } from '~/pages/marketing/shared/help-cards';

import { Link } from '@leather.io/ui';

interface NotFoundProps {
  heading?: string;
  recovery?: { href: string; label: string };
}

// Rendered by the `*` route and by ContentErrorBoundary for missing/retired content (404/410).
export function NotFound({
  heading = 'Oops! Seems like you took a wrong turn',
  recovery = { href: '/', label: 'Go to homepage' },
}: NotFoundProps) {
  return (
    <Page>
      <Page.Header />
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        textAlign="center"
        py={['space.08', null, 'space.10']}
      >
        <styled.img
          src="/marketing/404/wrong-turn.webp"
          alt="A red jelly figure tumbling down a flight of blue stairs"
          width={['180px', null, '200px']}
          height="auto"
          aspectRatio="440 / 429"
          transform="rotate(-10deg)"
          _motionSafe={{ animation: 'marketingFlyIn 1s cubic-bezier(0.24, 0, 0.24, 1) both' }}
        />
        <styled.h1 textStyle="heading.04" fontWeight="400" mt="space.05" maxW="300px">
          {heading}
        </styled.h1>
        <Link href={recovery.href} mt="space.04">
          {recovery.label}
        </Link>
      </Flex>
      <HelpCards mx={['-space.04', null, '0']} mb="space.09" />
    </Page>
  );
}
