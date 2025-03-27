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
  return (
    <StyledNavLink
      to={href}
      userSelect="none"
      prefetch="intent"
      role="link"
      display="block"
      textStyle="label.02"
      pl="space.04"
      py="space.04"
      outline="none"
      _hover={{ bg: 'ink.component-background-hover' }}
      _focusVisible={{ textDecoration: 'underline' }}
    >
      <Flag spacing="space.04" img={icon}>
        {children}
      </Flag>
    </StyledNavLink>
  );
}
