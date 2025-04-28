import type { ReactElement, ReactNode } from 'react';
import { NavLink } from 'react-router';

import { styled } from 'leather-styles/jsx';

import { Flag } from '@leather.io/ui';

const StyledNavLink = styled(NavLink);

interface NavItemProps {
  href: string;
  icon: ReactElement;
  children: ReactNode;
}
export function NavItem({ children, icon, href }: NavItemProps) {
  const content = (
    <Flag
      spacing="space.04"
      img={icon}
      userSelect="none"
      role="link"
      textStyle="label.02"
      pl="space.04"
      py="space.04"
      lineHeight="1.12"
      outline="none"
      _hover={{ bg: 'ink.component-background-hover' }}
      _focusVisible={{ textDecoration: 'underline' }}
    >
      {children}
    </Flag>
  );
  if (href.startsWith('https')) {
    return (
      <a href={href} rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <StyledNavLink to={href} prefetch="intent">
      {content}
    </StyledNavLink>
  );
}
