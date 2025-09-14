import { useEffect } from 'react';

import * as Sentry from '@sentry/react-native';

interface AssetSelectorErrorProps {
  error: Error;
}

export function AssetSelectorError({ error }: AssetSelectorErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        swap: 'asset-selector',
      },
      extra: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }, [error]);

  // TODO: Needs design
  return null;
}
