import { SbtcSponsoredCallSelectors } from '@tests/selectors/requests.selectors';
import { Stack } from 'leather-styles/jsx';

import { sbtcTransferManyFunctionName } from '@leather.io/stacks';
import { Approver, Callout, ItemLayout, Pressable } from '@leather.io/ui';
import { capitalize } from '@leather.io/utils';

import { closeWindow } from '@shared/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { getTransactionActions } from '@app/components/rpc-transaction-request/get-transaction-actions';
import { TransactionActionsTitle } from '@app/components/rpc-transaction-request/transaction-actions-title';
import { FeeItemIcon } from '@app/features/fee-editor/components/fee-item-icon';
import { type Fee, useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';

import { useStacksRpcTransactionRequestContext } from '../stacks-rpc-transaction-request.context';
import type { SbtcSponsoredCallOffer } from './use-sbtc-sponsored-call';

const signTransactionsLabel = 'Sign 2 transactions';

interface SbtcSponsoredCallFeeProps {
  offer: SbtcSponsoredCallOffer;
  functionName: string;
  contractName: string;
}
export function SbtcSponsoredCallFee({
  offer,
  functionName,
  contractName,
}: SbtcSponsoredCallFeeProps) {
  const { fees, selectedFee, onSetSelectedFee } = useFeeEditorContext();
  const tiers: Fee[] = [fees.slow, fees.standard, fees.fast];

  return (
    <>
      <Approver.Section data-testid={SbtcSponsoredCallSelectors.FeeSection}>
        <Approver.Subheader>Fee</Approver.Subheader>
        <Callout variant="info" title="Paid in sBTC" mb="space.02">
          Your STX balance cannot cover the network fee. A sponsor pays it for both transactions and
          takes this sBTC fee in the first one.
        </Callout>
        <Stack gap="space.00">
          {tiers.map(fee => (
            <Pressable key={fee.priority} onClick={() => onSetSelectedFee(fee)} my="space.02">
              <ItemLayout
                img={<FeeItemIcon priority={fee.priority} />}
                isSelected={fee.priority === selectedFee.priority}
                titleLeft={capitalize(fee.priority)}
                captionLeft={fee.time}
                titleRight={formatCurrency(offer.getTotal(fee))}
              />
            </Pressable>
          ))}
        </Stack>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>You&apos;ll sign 2 transactions</Approver.Subheader>
        <Stack gap="space.04" mb="space.03">
          <ItemLayout
            titleLeft="1. Fee to sponsor"
            captionLeft={sbtcTransferManyFunctionName}
            titleRight={formatCurrency(offer.total)}
            captionRight={`Nonce ${offer.paymentNonce}`}
          />
          <ItemLayout
            titleLeft={`2. ${functionName}`}
            captionLeft={contractName}
            captionRight={`Nonce ${offer.paymentNonce + 1}`}
          />
        </Stack>
        <Callout variant="warning" title="Keep this window open">
          The call is sent once the fee payment confirms. If you close the window before that, the
          fee is paid and the call is not sent.
        </Callout>
      </Approver.Section>
    </>
  );
}

interface SbtcSponsoredCallActionsProps {
  offer: SbtcSponsoredCallOffer;
  onApprove(): Promise<void>;
}
export function SbtcSponsoredCallActions({ offer, onApprove }: SbtcSponsoredCallActionsProps) {
  const { status } = useStacksRpcTransactionRequestContext();

  return (
    <Approver.Actions
      actions={getTransactionActions({
        isLoading: false,
        isBroadcasting: status === 'broadcasting',
        isSubmitted: status === 'submitted',
        isError: false,
        onCancel: () => closeWindow(),
        onApprove,
        approveLabel: signTransactionsLabel,
        busyLabel: 'Signing...',
      })}
    >
      <TransactionActionsTitle isLoading={false} amount={formatCurrency(offer.total)} />
    </Approver.Actions>
  );
}
