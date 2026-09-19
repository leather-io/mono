import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

interface DetailsLinkValueProps {
  href: string;
  children: ReactNode;
}

export function DetailsLinkValue({ href, children }: DetailsLinkValueProps) {
  return (
    <styled.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      textStyle="caption.01"
      borderBottom="1px solid"
      borderColor="ink.border-default"
      _hover={{ borderColor: 'ink.action-primary-hover' }}
      _focus={{ borderColor: 'ink.action-primary-hover' }}
      outline={0}
    >
      {children}
      <styled.span display="inline-block" transform="rotate(45deg)" ml="space.01">
        ↑
      </styled.span>
    </styled.a>
  );
}
