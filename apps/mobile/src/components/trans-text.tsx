import { Trans } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

export function TransText({ children, ...props }: Parameters<typeof Text>['0']) {
  return (
    <Text color="ink.text-primary" {...props}>
      <Trans>{children}</Trans>
    </Text>
  );
}
