import type { ReactElement, ReactNode } from 'react';
import { NavLink } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';

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
      width="100%"
      spacing="space.02"
      img={
        <Box width="16px" height="16px" display="flex" alignItems="center" justifyContent="center">
          {icon}
        </Box>
      }
      userSelect="none"
      role="link"
      textStyle="label.02"
      pl="space.04"
      py="space.04"
      lineHeight="1.05"
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
