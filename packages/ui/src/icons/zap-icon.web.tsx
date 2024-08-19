import ZapSmall from '../assets/icons/zap-16-16.svg';
import Zap from '../assets/icons/zap-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ZapIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ZapSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Zap />
    </Icon>
  );
}
