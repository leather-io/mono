import type { ReactElement, ReactNode } from 'react';
import { NavLink } from 'react-router';

import { css } from 'leather-styles/css';
import { Box, styled } from 'leather-styles/jsx';

import { ExternalLinkIcon, Flag } from '@leather.io/ui';

const StyledNavLink = styled(NavLink);

interface NavItemProps {
  href: string;
  icon: ReactElement;
  children: ReactNode;
  newTab?: boolean;
}
export function NavItem({ children, icon, href, newTab }: NavItemProps) {
  const content = (
    <Flag
      width="100%"
      spacing="space.02"
      img={
        <Box width="16px" height="16px" display="flex" alignItems="center" justifyContent="center">
          {icon}
        </Box>
      }
      className="group"
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
      <Box display="flex" alignItems="center" justifyContent="space-between" gap="space.02">
        {children}
        {newTab && (
          <Box
            width="16px"
            height="16px"
            alignItems="center"
            justifyContent="center"
            mr="space.04"
            className={css({ display: 'none', _groupHover: { display: 'flex' } })}
          >
            <ExternalLinkIcon type="small" color="ink.text-subdued" />
          </Box>
        )}
      </Box>
    </Flag>
  );
  if (href.startsWith('https')) {
    return (
      <a href={href} target={newTab ? '_blank' : '_self'} rel="noopener noreferrer">
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
