import { useNavigate } from 'react-router';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { ArrowLeftIcon } from '@leather.io/ui';

import { HeaderActionButton } from './header-action-button';

interface HeaderBackButtonProps {
  dataTestId?: string;
}

export function HeaderBackButton({ dataTestId }: HeaderBackButtonProps) {
  const navigate = useNavigate();
  return (
    <HeaderActionButton
      icon={<ArrowLeftIcon />}
      onAction={() => navigate(-1)}
      dataTestId={dataTestId ?? SharedComponentsSelectors.HeaderBackBtn}
    />
  );
}
