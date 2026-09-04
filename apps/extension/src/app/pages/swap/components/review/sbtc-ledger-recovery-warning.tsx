import { Callout, type CalloutProps } from '@leather.io/ui';

import { useWalletType } from '@app/common/use-wallet-type';

function SbtcLedgerRecoveryWarningLayout(props: CalloutProps) {
  return (
    <Callout variant="warning" {...props}>
      If a BTC → sBTC bridge fails, Ledger devices cannot recover the funds. Software access to your
      Ledger key would be required. Continue only if you understand this risk.
    </Callout>
  );
}

export function SbtcLedgerRecoveryWarning(props: CalloutProps) {
  const { whenWallet } = useWalletType();

  return whenWallet({
    ledger: <SbtcLedgerRecoveryWarningLayout {...props} />,
    software: null,
  });
}
