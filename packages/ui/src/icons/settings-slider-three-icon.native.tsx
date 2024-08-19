import SettingsSliderThreeSmall from '../assets/icons/settings-slider-three-16-16.svg';
import SettingsSliderThree from '../assets/icons/settings-slider-three-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SettingsSliderThreeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SettingsSliderThreeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <SettingsSliderThree />
    </Icon>
  );
}
