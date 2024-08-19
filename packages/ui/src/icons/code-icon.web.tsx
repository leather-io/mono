import CodeSmall from '../assets/icons/code-16-16.svg';
import Code from '../assets/icons/code-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function CodeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CodeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Code />
    </Icon>
  );
}
