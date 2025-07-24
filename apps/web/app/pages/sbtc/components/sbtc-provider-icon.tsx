import { AlexLogo } from '~/components/icons/alex-logo';
import { BitflowLogo } from '~/components/icons/bitflow-logo';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { VelarLogo } from '~/components/icons/velar-logo';
import { ZestLogo } from '~/components/icons/zest-logo';

interface SbtcProviderIconProps {
  id: string;
}
export function SbtcProviderIcon(props: SbtcProviderIconProps) {
  switch (props.id) {
    case 'basic':
      return <SbtcLogo size="32px" />;
    case 'alex':
      return <AlexLogo size="32px" />;
    case 'bitflow':
      return <BitflowLogo size="32px" />;
    case 'velar':
      return <VelarLogo size="32px" />;
    case 'zest':
      return <ZestLogo size="32px" />;
    default:
      return null;
  }
}
