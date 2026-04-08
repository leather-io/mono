import { captureMessage } from '@sentry/react';

import { Callout } from '@leather.io/ui';

import { useOnMount } from '@app/common/hooks/use-on-mount';

interface LegacyRequestCalloutProps {
  origin?: string | null;
  method: string;
}

export function LegacyRequestCallout({ origin, method }: LegacyRequestCalloutProps) {
  useOnMount(() => {
    captureMessage('Legacy API request detected', {
      level: 'info',
      tags: { legacy: 'deprecation' },
      extra: { origin, legacyMethod: method },
    });
  });

  return (
    <Callout mt="space.03" variant="warning" title="Developer Notice: Upgrade required" mb="space.05" width="100%">
      This app uses a deprecated API to communicate with Leather. Ask the developer to upgrade to
      the latest version.
    </Callout>
  );
}
