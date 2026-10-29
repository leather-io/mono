import { Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { HelpCards } from '~/pages/marketing/shared/help-cards';

// Rendered by the `*` route and by ContentErrorBoundary for missing/retired content (404/410).
export function NotFound() {
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
        />
        <styled.h1 textStyle="heading.04" fontWeight="400" mt="space.05" maxW="300px">
          Oops! Seems like you took a wrong turn
        </styled.h1>
      </Flex>
      <HelpCards mx={['-space.04', null, '0']} mb="space.09" />
    </Page>
  );
}
