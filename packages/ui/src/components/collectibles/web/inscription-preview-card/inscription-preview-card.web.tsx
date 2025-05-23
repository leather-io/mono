import { ReactElement } from 'react';

import { Flag } from '../../../../exports.web';
import { InscriptionMetadata } from './components/inscription-metadata.web';

interface InscriptionPreviewCardProps {
  action?(): void;
  actionLabel?: string;
  hideBorder?: boolean;
  icon?: ReactElement;
  image: ReactElement;
  subtitle: string;
  title: string;
}
export function InscriptionPreviewCard({
  action,
  actionLabel,
  hideBorder,
  icon,
  image,
  subtitle,
  title,
}: InscriptionPreviewCardProps) {
  return (
    <Flag
      border={hideBorder ? 'unset' : 'default'}
      borderRadius={hideBorder ? 'unset' : 'sm'}
      img={image}
      p={hideBorder ? 'unset' : 'space.04'}
      spacing="space.04"
    >
      <InscriptionMetadata
        action={action}
        actionLabel={actionLabel}
        icon={icon}
        subtitle={subtitle}
        title={title}
      />
    </Flag>
  );
}
