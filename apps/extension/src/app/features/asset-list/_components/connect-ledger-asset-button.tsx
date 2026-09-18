import { HStack, styled } from 'leather-styles/jsx';

import type { SupportedBlockchains } from '@leather.io/models';
import { Button, LedgerIcon } from '@leather.io/ui';

import { capitalize } from '@app/common/utils';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';

interface ConnectLedgerButtonProps {
  chain: SupportedBlockchains;
}
export function ConnectLedgerButton({ chain }: ConnectLedgerButtonProps) {
  const { open } = useLedgerFlow();

  function onClick() {
    open({ kind: 'request-keys', chain, autoConnect: false });
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
