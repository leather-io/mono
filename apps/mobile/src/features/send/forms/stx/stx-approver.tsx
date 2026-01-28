import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useBroadcastStacksTransaction } from '@/queries/stacks/use-broadcast-stacks-transaction';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { deserializeTransaction } from '@stacks/transactions';

interface StxApproverProps {
  txHex: string;
  onEdit(): void;
  accountId: string;
  closeApprover(): void;
}

export function StxApprover({ txHex: _txHex, onEdit, accountId, closeApprover }: StxApproverProps) {
  const [txHex, setTxHex] = useState<string>(_txHex);

  const network = useNetworkPreferenceStacksNetwork();
  const { list: accounts } = useAccounts();
  const signer = useStacksSigners().fromAccountId(accountId)[0];

  assertStacksSigner(signer);

  const txOptions = getTxOptions(signer, network);
  const { mutateAsync: broadcastTransaction } = useBroadcastStacksTransaction();
  const { displayToast } = useToastContext();

  async function onApprove() {
    assertStacksSigner(signer);
    const tx = deserializeTransaction(txHex);

    const signedTx = await signer?.sign(tx);

    try {
      const broadcastResult = await broadcastTransaction({ tx: signedTx, stacksNetwork: network });
      displayToast({ type: 'success', title: t`Transaction is sent!` });

      return broadcastResult.txid;
    } catch (err) {
      if (err instanceof Error) displayToast({ type: 'error', title: err.message });
      throw err;
    }
  }

  return (
    <BaseStxTxApproverLayout
      accountId={accountId}
      accounts={accounts}
      onApprove={onApprove}
      onBack={onEdit}
      onCloseApprover={closeApprover}
      setTxHex={setTxHex}
      txHex={txHex}
      txOptions={txOptions}
    />
  );
}
