import ExitSmall from '../assets/icons/exit-16-16.svg';
import Exit from '../assets/icons/exit-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ExitIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ExitSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Exit />
    </Icon>
  );
}
