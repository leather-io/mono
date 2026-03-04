import { type Location, useLocation, useNavigate } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box, Flex, Stack } from 'leather-styles/jsx';
import get from 'lodash.get';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useLocationStateWithCache } from '@app/common/hooks/use-location-state';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import { InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { InscriptionPreview } from '@app/components/inscription-preview-card/components/inscription-preview';
import { Card } from '@app/components/layout';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';

import { InscriptionPreviewCard } from '../../../components/inscription-preview-card/inscription-preview-card';
import { useSendInscriptionState } from './components/send-inscription-container';

function useSendInscriptionReviewState() {
  const location = useLocation();
  return {
    arrivesIn: get(location.state, 'time') as string,
    signedTx: get(location.state, 'signedTx') as Uint8Array,
    recipient: get(location.state, 'recipient', '') as string,
    feeRowValue: get(location.state, 'feeRowValue') as string,
  };
}

export function SendInscriptionReview() {
  const navigate = useNavigate();
  const backgroundLocation = useLocationStateWithCache<Location>('backgroundLocation');
  const { arrivesIn, signedTx, recipient, feeRowValue } = useSendInscriptionReviewState();

  const { inscription } = useSendInscriptionState();
  const { refetchUtxos } = useCurrentUtxos();
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();

  async function sendInscription() {
    await broadcastTx({
      skipSpendableCheckUtxoIds: [inscription.txid],
      tx: bytesToHex(signedTx),
      async onSuccess(txid: string) {
        analytics.track('broadcast_ordinal_transaction');
        await refetchUtxos();
        void navigate(
          `/${RouteUrls.SendOrdinalInscription}/${RouteUrls.SendOrdinalInscriptionSent}`,
          {
            state: {
              inscription,
              recipient,
              arrivesIn,
              txid,
              feeRowValue,
              backgroundLocation,
            },
          }
        );
      },
      onError(e) {
        analytics.track('broadcast_ordinal_error', { error: e });
        void navigate(
          `/${RouteUrls.SendOrdinalInscription}/${RouteUrls.SendOrdinalInscriptionError}`,
          {
            state: {
              error: e,
              backgroundLocation,
            },
          }
        );
      },
    });
  }

  return (
    <Sheet
      header={<SheetHeader title="Review" />}
      isShowing
      onGoBack={() => navigate(-1)}
      onClose={() => navigate(backgroundLocation ?? RouteUrls.Home)}
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
