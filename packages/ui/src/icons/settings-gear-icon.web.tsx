import SettingsGearSmall from '../assets/icons/settings-gear-16-16.svg';
import SettingsGear from '../assets/icons/settings-gear-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function SettingsGearIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SettingsGearSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <SettingsGear />
    </Icon>
  );
}
