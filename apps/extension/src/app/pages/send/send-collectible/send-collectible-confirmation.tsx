import { useNavigate } from 'react-router';

import { deserializeTransaction } from '@stacks/transactions';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Stack, styled } from 'leather-styles/jsx';
import { z } from 'zod';

import type { CollectibleView } from '@leather.io/features';
import { inferPrincipalTypeFromAddress } from '@leather.io/stacks';
import { Button, Callout } from '@leather.io/ui';
import { isString } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { useRouteState } from '@app/common/hooks/use-route-state';
import { useSubmitTransactionCallback } from '@app/common/hooks/use-submit-stx-transaction';
import {
  getNonceFromStacksTransaction,
  getStacksTransactionFee,
} from '@app/common/transactions/stacks/transaction.utils';
import { StacksAddressDisplayer } from '@app/components/address-displayer/stacks-address-displayer';
import { InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { Card, Content, Page } from '@app/components/layout';
import { FullPageLoadingSpinner } from '@app/components/loading-spinner';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useToast } from '@app/features/toasts/use-toast';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';
import { LoadingKeys, useLoading } from '@app/store/ui/ui.hooks';

import { CollectibleThumbnail } from './collectible-thumbnail';
import { useSendableCollectible } from './use-sendable-collectible';

const sendCollectibleConfirmationRouteStateSchema = z.object({
  recipient: z.string(),
  tx: z.string(),
});
export type SendCollectibleConfirmationRouteState = z.infer<
  typeof sendCollectibleConfirmationRouteStateSchema
>;

interface CollectibleConfirmationProps {
  view: CollectibleView;
}
function CollectibleConfirmation({ view }: CollectibleConfirmationProps) {
  const { recipient, tx: txHex } = useRouteState(sendCollectibleConfirmationRouteStateSchema);
  const navigate = useNavigate();
  const toast = useToast();
  const signStacksTransaction = useSignStacksTransaction();
  const submitTransaction = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.SUBMIT_STACKS_TRANSACTION,
  });
  const { isLoading } = useLoading(LoadingKeys.SUBMIT_STACKS_TRANSACTION);

  const tx = deserializeTransaction(txHex);

  async function onConfirm() {
    const signedTx = await signStacksTransaction(tx);
    if (!signedTx) return;
    await submitTransaction({
      onSuccess() {
        toast.success(`${view.title} sent`);
        void navigate(RouteUrls.Activity);
      },
      onError(error) {
        const message = isString(error) ? error : error.message;
        void navigate(RouteUrls.BroadcastError, { state: { message } });
      },
    })(signedTx);
  }

  return (
    <Card
      dataTestId={SendCryptoAssetSelectors.ConfirmationDetails}
      contentStyle={{ p: 'space.00' }}
      footer={
        <Button
          aria-busy={isLoading}
          data-testid={SendCryptoAssetSelectors.ConfirmSendTxBtn}
          onClick={() => void onConfirm()}
          width="100%"
        >
          Confirm and send transaction
        </Button>
      }
    >
      <Stack alignItems="center" gap="space.03" py="space.05" px="space.05">
        <CollectibleThumbnail view={view} size="96px" />
        <styled.span
          textStyle="heading.04"
          data-testid={SendCryptoAssetSelectors.ConfirmationDetailsAssetValue}
        >
          {view.title}
        </styled.span>
      </Stack>
      {inferPrincipalTypeFromAddress(recipient) === 'contract' && (
        <Callout variant="warning" title="Sending to a smart contract" px="space.03" mb="space.05">
          The recipient is a Stacks contract address. Make sure the contract can manage this
          collectible before you send it.
        </Callout>
      )}
      <Stack pb="space.06" px="space.06" width="100%">
        <InfoCardRow
          title="To"
          value={<StacksAddressDisplayer address={recipient} />}
          data-testid={SendCryptoAssetSelectors.ConfirmationDetailsRecipient}
        />
        <InfoCardSeparator />
        <InfoCardRow title="Sending" value={view.title} />
        <InfoCardRow
          title="Fee"
          value={formatCurrency(getStacksTransactionFee(tx))}
          data-testid={SendCryptoAssetSelectors.ConfirmationDetailsFee}
        />
        <InfoCardRow title="Nonce" value={getNonceFromStacksTransaction(tx)} />
      </Stack>
    </Card>
  );
}

export function SendCollectibleConfirmation() {
  const { isPending, view } = useSendableCollectible();

  function renderContent() {
    if (isPending) return <FullPageLoadingSpinner />;
    if (!view)
      return (
        <Callout variant="info" title="Collectible not found">
          This collectible is not available for this account.
        </Callout>
      );
    return <CollectibleConfirmation view={view} />;
  }

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>{renderContent()}</Page>
      </Content>
    </>
  );
}
