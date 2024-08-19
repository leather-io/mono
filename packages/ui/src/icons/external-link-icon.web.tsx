import ExternalLinkSmall from '../assets/icons/external-link-16-16.svg';
import ExternalLink from '../assets/icons/external-link-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ExternalLinkIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ExternalLinkSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ExternalLink />
    </Icon>
  );
}
