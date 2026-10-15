import { z } from 'zod';

import { useRouteState } from '@app/common/hooks/use-route-state';
import { GenericError, GenericErrorListItem } from '@app/components/generic-error/generic-error';

const helpTextList = [
  <GenericErrorListItem key={1} text="Please report issue to requesting app" />,
];

const requestErrorRouteStateSchema = z
  .object({ message: z.string().catch(''), title: z.string().catch('') })
  .catch({ message: '', title: '' });

export function RequestError() {
  const { message, title } = useRouteState(requestErrorRouteStateSchema);

  return <GenericError body={message} helpTextList={helpTextList} title={title} />;
}
