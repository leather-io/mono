import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { styled } from 'leather-styles/jsx';
import { getUiPackageAssetUrl } from '~/helpers/utils';

import { Flag } from '@leather.io/ui';

const StyledNavLink = styled(NavLink);

interface NavItemProps {
  href: string;
  icon: string;
  children: ReactNode;
}
export function NavItem({ children, icon, href }: NavItemProps) {
  return (
    <StyledNavLink
      to={href}
      prefetch="intent"
      role="link"
      display="block"
      textStyle="label.02"
      pl="space.04"
      py="space.02"
      outline="none"
      _hover={{ bg: 'ink.component-background-hover' }}
      _focusVisible={{ textDecoration: 'underline' }}
    >
      <Flag
        spacing="space.04"
        img={
          <styled.img
            userSelect="none"
            src={getUiPackageAssetUrl(`icons/${icon}-16-16.svg`)}
            alt={`${icon} icon`}
          />
        }
      >
        {children}
      </Flag>
    </StyledNavLink>
  );
}
