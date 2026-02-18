import { HStack, styled } from 'leather-styles/jsx';

import type { Blockchain } from '@leather.io/models';
import { Button, LedgerIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { capitalize } from '@app/common/utils';
import { useLocation, useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { ledgerNavigationSlice } from '@app/store/navigation/ledger-navigation.slice';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

interface ConnectLedgerButtonProps {
  chain: Blockchain;
}
export function ConnectLedgerButton({ chain }: ConnectLedgerButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  function onClick() {
    dispatch(ledgerNavigationSlice.actions.setImmediatelyAttemptConnection(true));
    dispatch(
      ledgerNavigationSlice.actions.setLedgerTxSigningState({
        tx: '',
        fromLocationPathname: location.pathname,
      })
    );
    dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
    void navigate(`${chain}/connect-your-ledger`, {
      replace: true,
    });
  }

  return (
    <Button variant="outline" size="md" onClick={onClick}>
      <HStack>
        <LedgerIcon />
        <styled.span textStyle="label.02">Connect&nbsp;{capitalize(chain)}</styled.span>
      </HStack>
    </Button>
  );
}
