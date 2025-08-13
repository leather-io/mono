import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useBroadcastStxTransaction } from '@/queries/stacks/use-broadcast-stx-transaction';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { t } from '@lingui/core/macro';
import { deserializeTransaction } from '@stacks/transactions';

export function Sip10Approver({
  txHex: _txHex,
  onEdit,
  onSuccess,
  accountId,
}: {
  txHex: string;
  onEdit(): void;
  onSuccess(): void;
  accountId: string;
}) {
  const [txHex, setTxHex] = useState<string>(_txHex);

  const network = useNetworkPreferenceStacksNetwork();
  const { list: accounts } = useAccounts();
  const signer = useStacksSigners().fromAccountId(accountId)[0];

  assertStacksSigner(signer);

  const txOptions = getTxOptions(signer, network);
  const { mutateAsync: broadcastTransaction } = useBroadcastStxTransaction();
  const { displayToast } = useToastContext();

  async function onApprove() {
    assertStacksSigner(signer);
    const tx = deserializeTransaction(txHex);

    const signedTx = await signer?.sign(tx);

    await broadcastTransaction(
      { tx: signedTx, stacksNetwork: network },
      {
        onError(err) {
          displayToast({ type: 'error', title: err.message });
        },
        onSuccess() {
          displayToast({ type: 'success', title: t`Transaction is sent!` });

          onSuccess();
        },
      }
    );
  }

  return (
    <BaseStxTxApproverLayout
      txHex={txHex}
      setTxHex={setTxHex}
      txOptions={txOptions}
      onCloseApprover={onEdit}
      accountId={accountId}
      accounts={accounts}
      onApprove={onApprove}
      backButtonTitle={t`Edit`}
    />
  );
}
