import { useAsync } from 'react-async-hook';
import { Outlet, useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Form, Formik } from 'formik';
import { Box, Flex } from 'leather-styles/jsx';
import { z } from 'zod';

import type { CollectibleView } from '@leather.io/features';
import { FeeTypes } from '@leather.io/models';
import { createCollectibleTransferBlockerQueryConfig } from '@leather.io/queries';
import { generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { Button, Callout, Link } from '@leather.io/ui';
import { assertExistence, createMoney, stxToMicroStx } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { createFormikValidationSchema } from '@app/common/validation/formik-validation-schema';
import { stxFeeValidator } from '@app/common/validation/forms/fee-validators';
import { stxRecipientValidator } from '@app/common/validation/forms/recipient-validators';
import { nonceValidator } from '@app/common/validation/nonce-validators';
import { FeesRow } from '@app/components/fees-row/fees-row';
import { ButtonRow, Card, Content, Page } from '@app/components/layout';
import { CurrentStacksAccountLoader } from '@app/components/loaders/stacks-account-loader';
import { FullPageLoadingSpinner } from '@app/components/loading-spinner';
import { NonceSetter } from '@app/components/nonce-setter';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { useStxAddressAvailableUnlockedBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useStacksTransactionFees } from '@app/query/stacks/fees/stacks-transaction-fees.hooks';
import type { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';
import {
  useCurrentNetworkState,
  useCurrentStacksNetworkState,
} from '@app/store/networks/networks.hooks';

import { SelectedAssetField } from '../send-crypto-asset-form/components/selected-asset-field';
import { StacksRecipientField } from '../send-crypto-asset-form/family/stacks/components/stacks-recipient-field';
import { defaultSendFormFormikProps } from '../send-crypto-asset-form/send-form.utils';
import { CollectibleThumbnail } from './collectible-thumbnail';
import type { SendCollectibleConfirmationRouteState } from './send-collectible-confirmation';
import {
  createCollectibleTransferTxOptions,
  getCollectibleTransferBlockerMessage,
} from './send-collectible.utils';
import { useSendableCollectible } from './use-sendable-collectible';

interface SendCollectibleFormValues {
  recipient: string;
  recipientBnsName: string;
  fee: number | string;
  feeCurrency: string;
  feeType: string;
  nonce?: number | string;
}

interface CollectibleSendFormProps {
  account: StacksAccount;
  view: CollectibleView;
}
function CollectibleSendForm({ account, view }: CollectibleSendFormProps) {
  const { asset } = view;
  const navigate = useNavigate();
  const network = useCurrentStacksNetworkState();
  const currentNetwork = useCurrentNetworkState();
  const availableBalance = useStxAddressAvailableUnlockedBalance(account.address);

  const { result: unsignedTxForFeeEstimation } = useAsync(
    () =>
      generateStacksUnsignedTransaction(
        createCollectibleTransferTxOptions({
          asset,
          sender: account.address,
          publicKey: account.stxPublicKey,
          recipient: account.address,
          fee: createMoney(0, 'STX'),
          nonce: 0,
          network,
        })
      ),
    [asset.assetId, asset.tokenId, account.address, account.stxPublicKey, network]
  );
  const { data: fees } = useStacksTransactionFees(unsignedTxForFeeEstimation);

  const initialValues: SendCollectibleFormValues = {
    recipient: '',
    recipientBnsName: '',
    fee: '',
    feeCurrency: 'STX',
    feeType: FeeTypes[FeeTypes.Unknown],
  };

  const validationSchema = createFormikValidationSchema(
    z.object({
      recipient: stxRecipientValidator(account.address, currentNetwork),
      fee: stxFeeValidator(availableBalance),
      nonce: nonceValidator,
    })
  );

  async function onSubmit(values: SendCollectibleFormValues) {
    assertExistence(values.nonce, 'Nonce is required to send a collectible');
    const tx = await generateStacksUnsignedTransaction(
      createCollectibleTransferTxOptions({
        asset,
        sender: account.address,
        publicKey: account.stxPublicKey,
        recipient: values.recipient,
        fee: createMoney(stxToMicroStx(values.fee), 'STX'),
        nonce: values.nonce,
        network,
      })
    );
    void navigate(
      replaceRouteParams(RouteUrls.SendCollectibleConfirmation, {
        assetId: asset.assetId,
        tokenId: asset.tokenId,
      }),
      {
        state: {
          recipient: values.recipient,
          tx: tx.serialize(),
        } satisfies SendCollectibleConfirmationRouteState,
      }
    );
  }

  return (
    <Page>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        {...defaultSendFormFormikProps}
      >
        {props => (
          <>
            <NonceSetter />
            <Form>
              <Card
                dataTestId={SendCryptoAssetSelectors.SendForm}
                footer={
                  <ButtonRow>
                    <Button
                      aria-busy={props.isValidating || props.isSubmitting}
                      data-testid={SendCryptoAssetSelectors.PreviewSendTxBtn}
                      type="submit"
                      fullWidth
                    >
                      Continue
                    </Button>
                  </ButtonRow>
                }
              >
                <Flex width="100%" flexDirection="column">
                  <SelectedAssetField
                    icon={<CollectibleThumbnail view={view} size="40px" />}
                    name={view.title}
                    symbol={view.subtitle}
                  />
                  <StacksRecipientField />
                  <Box mt="space.04" width="100%">
                    <FeesRow fees={fees} isSponsored={false} />
                  </Box>
                  <Link
                    alignSelf="flex-end"
                    mt="space.04"
                    onClick={() => void navigate(RouteUrls.EditNonce)}
                  >
                    Edit nonce
                  </Link>
                </Flex>
              </Card>
              <Outlet />
            </Form>
          </>
        )}
      </Formik>
    </Page>
  );
}

interface CollectibleTransferGateProps {
  view: CollectibleView;
}
function CollectibleTransferGate({ view }: CollectibleTransferGateProps) {
  const settings = useUserSettings();
  const transferBlocker = useQuery(
    createCollectibleTransferBlockerQueryConfig(view.asset, settings)
  );

  if (transferBlocker.isPending) return <FullPageLoadingSpinner />;

  if (transferBlocker.isError)
    return (
      <Callout variant="warning" title="Unable to check this collectible">
        Try again in a few moments.
      </Callout>
    );

  if (transferBlocker.data)
    return (
      <Callout
        variant="warning"
        title="This collectible cannot be sent"
        data-testid={SendCryptoAssetSelectors.SendCollectibleTransferBlocked}
      >
        {getCollectibleTransferBlockerMessage(transferBlocker.data)}
      </Callout>
    );

  return (
    <CurrentStacksAccountLoader>
      {account => <CollectibleSendForm account={account} view={view} />}
    </CurrentStacksAccountLoader>
  );
}

export function SendCollectibleForm() {
  const { isPending, view } = useSendableCollectible();

  function renderContent() {
    if (isPending) return <FullPageLoadingSpinner />;
    if (!view)
      return (
        <Callout variant="info" title="Collectible not found">
          This collectible is not available for this account.
        </Callout>
      );
    return <CollectibleTransferGate view={view} />;
  }

  return (
    <>
      <PageHeader title="Send" />
      <Content>{renderContent()}</Content>
    </>
  );
}
