import CloseSmall from '../assets/icons/close-small.svg';
import Close from '../assets/icons/close.svg';
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
