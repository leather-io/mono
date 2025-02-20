import { useLingui } from '@lingui/react';

import { Badge, BadgeProps } from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

type FeeType = 'low' | 'normal' | 'high' | 'extremely-high';

interface FeeBadgeProps {
  type: FeeType;
}

export function FeeBadge(props: FeeBadgeProps) {
  const { i18n } = useLingui();
  const matchVariant = match<FeeType>();

  const variant = matchVariant<BadgeProps['variant']>(props.type, {
    low: 'success',
    normal: 'default',
    high: 'error',
    'extremely-high': 'error',
  });

  const title = matchVariant<string>(props.type, {
    low: i18n._({
      id: 'approval-ux.fees.low',
      message: 'currently low',
    }),
    normal: i18n._({
      id: 'approval-ux.fees.normal',
      message: 'currently normal',
    }),
    high: i18n._({
      id: 'approval-ux.fees.high',
      message: 'currently high',
    }),
    'extremely-high': i18n._({
      id: 'approval-ux.fees.extremely-high',
      message: 'currently extremely high',
    }),
  });

  return <Badge variant={variant} px="1" label={title} />;
}
