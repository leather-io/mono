import PlaygroundFormsSmall from '../assets/icons/playground-forms-16-16.svg';
import PlaygroundForms from '../assets/icons/playground-forms-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PlaygroundFormsIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PlaygroundFormsSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <PlaygroundForms />
    </Icon>
  );
}
