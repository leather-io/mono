import EmailSmall from '../assets/icons/email-16-16.svg';
import Email from '../assets/icons/email-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function EmailIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <EmailSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Email />
    </Icon>
  );
}
