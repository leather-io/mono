import SupportSmall from '../assets/icons/support-16-16.svg';
import Support from '../assets/icons/support-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function SupportIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SupportSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Support />
    </Icon>
  );
}
