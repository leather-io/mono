import { useNavigate } from 'react-router';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { ArrowLeftIcon } from '@leather.io/ui';

import { HeaderActionButton } from './header-action-button';

export function HeaderBackButton() {
  const navigate = useNavigate();
  return (
    <HeaderActionButton
      icon={<ArrowLeftIcon />}
      onAction={() => navigate(-1)}
      dataTestId={SharedComponentsSelectors.HeaderBackBtn}
    />
  );
}
