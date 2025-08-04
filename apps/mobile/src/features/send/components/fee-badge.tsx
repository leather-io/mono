import { t } from '@lingui/core/macro';

import { Badge, BadgeProps } from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

type FeeType = 'low' | 'normal' | 'high' | 'extremely-high';

interface FeeBadgeProps {
  type: FeeType;
}

export function FeeBadge(props: FeeBadgeProps) {
  const matchVariant = match<FeeType>();

  const variant = matchVariant<BadgeProps['variant']>(props.type, {
    low: 'success',
    normal: 'default',
    high: 'error',
    'extremely-high': 'error',
  });

  const title = matchVariant<string>(props.type, {
    low: t`Currently low`,
    normal: t`Currently normal`,
    high: t`Currently high`,
    'extremely-high': t`Currently extremely high`,
  });

  return <Badge variant={variant} px="1" label={title} />;
}
