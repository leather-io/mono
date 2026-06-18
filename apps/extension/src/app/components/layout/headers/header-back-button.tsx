import { useNavigate } from 'react-router';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { ArrowLeftIcon } from '@leather.io/ui';

import { HeaderActionButton } from './header-action-button';

interface HeaderBackButtonProps {
  onBack?(): void;
}
export function HeaderBackButton({ onBack }: HeaderBackButtonProps) {
  const navigate = useNavigate();
  return (
    <HeaderActionButton
      icon={<ArrowLeftIcon />}
      onAction={() => (onBack ? onBack() : navigate(-1))}
      dataTestId={SharedComponentsSelectors.HeaderBackBtn}
    />
  );
}
