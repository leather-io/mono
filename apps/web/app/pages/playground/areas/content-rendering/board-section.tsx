import type { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

interface BoardSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function BoardSection({ title, description, children }: BoardSectionProps) {
  return (
    <Flex direction="column" gap="space.04">
      <Flex direction="column" gap="space.01">
        <styled.h2 textStyle="heading.05" color="ink.text-primary">
          {title}
        </styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="640px">
          {description}
        </styled.p>
      </Flex>
      {children}
    </Flex>
  );
}
