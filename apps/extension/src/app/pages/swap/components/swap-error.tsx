import { useSelector } from 'react-redux';

import { styled } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { GenericError, GenericErrorListItem } from '@app/components/generic-error/generic-error';
import { useNavigate } from '@app/routes/compat';
import type { RootState } from '@app/store';

const helpTextList = [
  <GenericErrorListItem
    key={1}
    text={<styled.span textStyle="label.02">Please report issue to swap protocol</styled.span>}
  />,
];

export function SwapError() {
  const navigate = useNavigate();
  const errorState = useSelector((state: RootState) => state.navigation.misc.errorState);

  return (
    <GenericError
      body={errorState?.message ?? ''}
      helpTextList={helpTextList}
      mb="space.06"
      onClose={() => navigate(RouteUrls.Home)}
      title={errorState?.title ?? ''}
    />
  );
}
