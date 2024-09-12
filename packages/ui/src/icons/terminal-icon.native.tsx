import TerminalSmall from '../assets/icons/terminal-16-16.svg';
import Terminal from '../assets/icons/terminal-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function TerminalIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <TerminalSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Terminal />
    </Icon>
  );
}
