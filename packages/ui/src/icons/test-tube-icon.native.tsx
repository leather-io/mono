import TestTubeSmall from '../assets/icons/test-tube-16-16.svg';
import TestTube from '../assets/icons/test-tube-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function TestTubeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <TestTubeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <TestTube />
    </Icon>
  );
}
