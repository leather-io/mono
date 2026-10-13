import { styled } from 'leather-styles/jsx';

import { LeatherLogomarkIcon } from '../icons/leather-logomark-icon.web';

interface LogoProps {
  onClick?(): void;
}
export function Logo({ onClick }: LogoProps) {
  return (
    <styled.button
      _hover={onClick && { color: 'ink.action-primary-hover' }}
      color="ink.text-primary"
      cursor={onClick ? 'pointer' : 'unset'}
      onClick={onClick ? onClick : undefined}
      height="headerContainerHeight"
    >
      <LeatherLogomarkIcon />
    </styled.button>
  );
}
