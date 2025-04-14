import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { RotatedArrow } from './icons/rotated-icon';

interface ExternalLinkProps extends HTMLStyledProps<'a'> {
  href: string;
  withIcon?: boolean;
}

export function ExternalLink({ href, withIcon, children, ...props }: ExternalLinkProps) {
  return (
    <styled.a
      textStyle="label.03"
      borderBottom="1px solid"
      borderColor="ink.text-non-interactive"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      _hover={{ borderColor: 'ink.action-primary-hover' }}
      _focus={{ borderColor: 'ink.action-primary-hover' }}
      outline={0}
      {...props}
    >
      {children}
      {withIcon && <RotatedArrow />}
    </styled.a>
  );
}
