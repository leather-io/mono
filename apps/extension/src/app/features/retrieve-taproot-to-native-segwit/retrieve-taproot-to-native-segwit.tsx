import { Stack } from 'leather-styles/jsx';

import { Link } from '@leather.io/ui';
import { delay, truncateMiddle } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import { InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentTaprootBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentTaprootUninscribedUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useNavigate } from '@app/routes/compat';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { RetrieveTaprootToNativeSegwitLayout } from './components/retrieve-taproot-to-native-segwit.layout';
import { useGenerateRetrieveTaprootFundsTx } from './use-generate-retrieve-taproot-funds-tx';

export function RetrieveTaprootToNativeSegwit() {
  const toast = useToast();
  const navigate = useNavigate();

  const balance = useCurrentTaprootBtcBalanceWithFallback();
  const recipient = useCurrentAccountNativeSegwitAddressIndexZero();
  const { utxos: uninscribedUtxos } = useCurrentTaprootUninscribedUtxos();

  const { generateRetrieveTaprootFundsTx, fee } = useGenerateRetrieveTaprootFundsTx();
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();

  async function handleBroadcastRetrieveBitcoinTx() {
    const tx = generateRetrieveTaprootFundsTx({ recipient, fee });
    await broadcastTx({
      tx,
      async onSuccess() {
        await delay(1200);
        toast.success('Transaction submitted!');
        await delay(700);
        void navigate(RouteUrls.Activity);
        analytics.track('broadcast_retrieve_taproot_to_native_segwit');
      },
      onError(e) {
        alert(e);
      },
    });
  }

  return (
    <RetrieveTaprootToNativeSegwitLayout
      isBroadcasting={isBroadcasting}
      onApproveTransaction={handleBroadcastRetrieveBitcoinTx}
      onClose={() => navigate(RouteUrls.Home)}
    >
      <Stack width="100%">
        <InfoCardRow title="Your address" value={<FormAddressDisplayer address={recipient} />} />
        <InfoCardSeparator />
        <InfoCardRow
          title="Amount"
          value={formatCurrency(balance.btc.availableBalance, { preset: 'pad-decimals' })}
        />
        <InfoCardRow title="Fee" value={formatCurrency(fee, { preset: 'pad-decimals' })} />
        <InfoCardSeparator />
        {uninscribedUtxos.map((utxo, i) => (
          <InfoCardRow
            key={utxo.txid}
            title={`Uninscribed UTXO #${i}`}
            value={
              <Link href={`https://ordinals.com/output/${utxo.txid}:${utxo.vout}`}>
                {`${truncateMiddle(utxo.txid, 4)}:${utxo.vout}`} ↗
              </Link>
            }
          />
        ))}
      </Stack>
    </RetrieveTaprootToNativeSegwitLayout>
  );
}
