import HeadSmall from '../assets/icons/head-16-16.svg';
import Head from '../assets/icons/head-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function HeadIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <HeadSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Head />
    </Icon>
  );
}
