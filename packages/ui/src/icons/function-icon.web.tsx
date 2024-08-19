import FunctionSmall from '../assets/icons/function-16-16.svg';
import Function from '../assets/icons/function-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function FunctionIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <FunctionSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Function />
    </Icon>
  );
}
