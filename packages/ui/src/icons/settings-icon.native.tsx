import SettingsSmall from '../assets/icons/settings-small.svg';
import Settings from '../assets/icons/settings.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SettingsIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SettingsSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Settings />
    </Icon>
  );
}
