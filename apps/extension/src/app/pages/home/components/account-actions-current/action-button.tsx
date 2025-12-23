import { type ComponentProps } from 'react';

import { Button } from '@leather.io/ui';

export function ActionButton(props: ComponentProps<typeof Button>) {
  return <Button minWidth={100} display="flex" flexGrow={1} {...props} />;
}
