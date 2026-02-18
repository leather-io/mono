import { useSelector } from 'react-redux';

import { bytesToHex } from '@noble/hashes/utils';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box, Flex, Stack } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import { InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { InscriptionPreview } from '@app/components/inscription-preview-card/components/inscription-preview';
import { Card } from '@app/components/layout';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useNavigate } from '@app/routes/compat';
import { type RootState, useAppDispatch } from '@app/store';
import { sendNavigationSlice } from '@app/store/navigation/send-navigation.slice';

import { InscriptionPreviewCard } from '../../../components/inscription-preview-card/inscription-preview-card';
import { useSendInscriptionState } from './components/send-inscription-container';

function useSendInscriptionReviewState() {
  const inscriptionFlow = useSelector((state: RootState) => state.navigation.send.inscriptionFlow);
  return {
    arrivesIn: inscriptionFlow?.time ?? '',
    signedTx: inscriptionFlow?.signedTx ? new Uint8Array(inscriptionFlow.signedTx) : null,
    recipient: inscriptionFlow?.recipient ?? '',
    feeRowValue: inscriptionFlow?.feeRowValue ?? '',
  };
}

export function SendInscriptionReview() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const backgroundPathname = useSelector(
    (state: RootState) => state.navigation.modal.backgroundLocationPathname
  );
  const { arrivesIn, signedTx, recipient, feeRowValue } = useSendInscriptionReviewState();

  const { inscription } = useSendInscriptionState();
  const { refetchUtxos } = useCurrentNativeSegwitUtxos();
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();

  async function sendInscription() {
    if (!signedTx) return;
    await broadcastTx({
      skipSpendableCheckUtxoIds: [inscription.txid],
      tx: bytesToHex(signedTx),
      async onSuccess(txid: string) {
        analytics.track('broadcast_ordinal_transaction');
        await refetchUtxos();
        dispatch(
          sendNavigationSlice.actions.setInscriptionFlowState({
            txid,
          })
        );
        void navigate(
          `/${RouteUrls.SendOrdinalInscription}/${RouteUrls.SendOrdinalInscriptionSent}`
        );
      },
      onError(e) {
        analytics.track('broadcast_ordinal_error', { error: e });
        dispatch(sendNavigationSlice.actions.setSendError(e));
        void navigate(
          `/${RouteUrls.SendOrdinalInscription}/${RouteUrls.SendOrdinalInscriptionError}`
        );
      },
    });
  }

  return (
    <Sheet
      header={<SheetHeader title="Review" />}
      isShowing
      onGoBack={() => navigate(-1)}
      onClose={() => navigate(backgroundPathname ?? RouteUrls.Home)}
    >
      <Card
        dataTestId={SendCryptoAssetSelectors.ConfirmationDetails}
        border="unset"
        contentStyle={{
          p: 'space.00',
        }}
        footer={
          <Button
            variant="solid"
            disabled={isBroadcasting}
            aria-busy={isBroadcasting}
            onClick={sendInscription}
            width="100%"
          >
            Confirm and send transaction
          </Button>
        }
      >
        <Box px="space.06" mt="space.06">
          <InscriptionPreviewCard
            image={<InscriptionPreview inscription={inscription} />}
            subtitle="Ordinal inscription"
            title={inscription.title}
          />
        </Box>

        <Flex
          alignItems="center"
          flexDirection="column"
          justifyItems="center"
          width="100%"
          pt="space.06"
          pb="space.06"
          px="space.06"
        >
          <Stack width="100%" mb="36px">
            <InfoCardRow
              data-testid={SendCryptoAssetSelectors.ConfirmationDetailsRecipient}
              title="To"
              value={<FormAddressDisplayer address={recipient} />}
            />
            <InfoCardSeparator />
            {arrivesIn && <InfoCardRow title="Estimated confirmation time" value={arrivesIn} />}
            <InfoCardRow title="Fee" value={feeRowValue} />
          </Stack>
        </Flex>
      </Card>
    </Sheet>
  );
}
