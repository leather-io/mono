import { useSelector } from 'react-redux';

import { GenericError, GenericErrorListItem } from '@app/components/generic-error/generic-error';
import type { RootState } from '@app/store';

const helpTextList = [
  <GenericErrorListItem key={1} text="Please report issue to requesting app" />,
];

export function RequestError() {
  const errorState = useSelector((state: RootState) => state.navigation.misc.errorState);

  return (
    <GenericError
      body={errorState?.message ?? ''}
      helpTextList={helpTextList}
      title={errorState?.title ?? ''}
    />
  );
}
