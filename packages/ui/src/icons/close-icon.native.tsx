import CloseSmall from '../assets/icons/close-16-16.svg';
import Close from '../assets/icons/close-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function CloseIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CloseSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Close />
    </Icon>
  );
}
