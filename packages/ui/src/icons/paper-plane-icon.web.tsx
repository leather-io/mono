import PaperPlaneSmall from '../assets/icons/paper-plane-16-16.svg';
import PaperPlane from '../assets/icons/paper-plane-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function PaperPlaneIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PaperPlaneSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <PaperPlane />
    </Icon>
  );
}
