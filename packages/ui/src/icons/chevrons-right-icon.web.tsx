import ChevronsRightSmall from '../assets/icons/chevrons-right-16-16.svg';
import ChevronsRight from '../assets/icons/chevrons-right-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ChevronsRightIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ChevronsRightSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ChevronsRight />
    </Icon>
  );
}
