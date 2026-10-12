import { useLocation } from 'react-router';

import { GenericError, GenericErrorListItem } from '@app/components/generic-error/generic-error';
import { readRouteStateString } from '@app/pages/read-route-state';

const helpTextList = [
  <GenericErrorListItem key={1} text="Please report issue to requesting app" />,
];

function useRequestErrorState() {
  const location = useLocation();
  const state: unknown = location.state;
  const message = readRouteStateString(state, 'message', '');
  const title = readRouteStateString(state, 'title', '');

  return { message, title };
}

export function RequestError() {
  const { message, title } = useRequestErrorState();

  return <GenericError body={message} helpTextList={helpTextList} title={title} />;
}
