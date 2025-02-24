import { styled } from 'leather-styles/jsx';

import type { Route } from './+types/docs';

export default function DocsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <styled.div p="space.04">
        <styled.h1 textStyle="display.02">Leather docs page</styled.h1>
        <styled.h2 textStyle="heading.03">Featured articles</styled.h2>
      </styled.div>
    </main>
  );
}
