import ExternalLink16 from '../assets/icons/external-link-16-16.svg';
import ExternalLink24 from '../assets/icons/external-link-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ExternalLinkIcon = createNativeIcon({
  icon: {
    small: ExternalLink16,
    medium: ExternalLink24,
  },
  displayName: 'ExternalLink',
});
