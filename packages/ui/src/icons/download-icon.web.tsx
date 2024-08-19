import DownloadSmall from '../assets/icons/download-16-16.svg';
import Download from '../assets/icons/download-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function DownloadIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <DownloadSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Download />
    </Icon>
  );
}
