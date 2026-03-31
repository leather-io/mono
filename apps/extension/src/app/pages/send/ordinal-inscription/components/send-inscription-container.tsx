import { useState } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router';

import get from 'lodash.get';

import { createBitcoinAddress, lookupDerivationByAddress } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { BtcFeeType, InscriptionAsset } from '@leather.io/models';
import { type UtxoWithDerivationPath } from '@leather.io/query';

import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { type BitcoinFeeRatesData } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentTaprootAccount } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useSendInscriptionRouteState } from '../hooks/use-send-inscription-route-state';
import { createUtxoFromInscription } from './create-utxo-from-inscription';
import { SendInscriptionLoader } from './send-inscription-loader';

interface SendInscriptionContextState {
  feeRates: BitcoinFeeRatesData;
  inscription: InscriptionAsset;
  selectedFeeType: BtcFeeType;
  setSelectedFeeType(value: BtcFeeType | null): void;
  utxo: UtxoWithDerivationPath;
}
export function useSendInscriptionState() {
  const location = useLocation();
  const context = useOutletContext<SendInscriptionContextState>();
  return { ...context, recipient: get(location.state, 'recipient', '') as string };
}

export function SendInscriptionContainer() {
  const [selectedFeeType, setSelectedFeeType] = useState<BtcFeeType | null>(null);
  const [inscription, setInscription] = useState<InscriptionAsset | null>(null);
  const [utxo, setUtxo] = useState<UtxoWithDerivationPath | null>(null);

  const routeState = useSendInscriptionRouteState();
  const network = useCurrentNetwork();
  const currentAccount = useCurrentAccountId();
  const currentAccountIndex = currentAccount.accountIndex;

  const taprootAccount = useCurrentTaprootAccount();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();

  useOnMount(() => {
    if (!routeState.inscription) return;
    const inscriptionAddress = createBitcoinAddress(routeState.inscription.address);

    if (
      !taprootAccount?.keychain.publicExtendedKey ||
      !nativeSegwitAccount?.keychain.publicExtendedKey
    ) {
      throw new Error('Missing account keychain data');
    }

    const result = lookupDerivationByAddress({
      taprootXpub: taprootAccount.keychain.publicExtendedKey,
      nativeSegwitXpub: nativeSegwitAccount.keychain.publicExtendedKey,
      iterationLimit: 100,
    })(inscriptionAddress);

    analytics.untypedTrack('recurse_addresses_to_find_derivation_path', {
      duration: result.duration,
    });

    if (result.status !== 'success') {
      analytics.untypedTrack('error_did_not_find_owner_path_of_inscription', {
        inscription: routeState.inscription.id,
      });
      throw new Error('Unable to find key of owner inscription address');
    }

    const adddressIndex = extractAddressIndexFromPath(result.path);
    const changeIndex = extractChangeIndexFromPath(result.path);

    setInscription(routeState.inscription);
    setUtxo(
      createUtxoFromInscription({
        inscription: routeState.inscription,
        network: network.chain.bitcoin.mode,
        accountIndex: currentAccountIndex,
        changeIndex,
        inscriptionAddressIdx: adddressIndex,
      })
    );
  });

  if (!inscription || !utxo) return null;

  return (
    <SendInscriptionLoader>
      {({ feeRates }) => (
        <Outlet context={{ feeRates, inscription, selectedFeeType, setSelectedFeeType, utxo }} />
      )}
    </SendInscriptionLoader>
  );
}
