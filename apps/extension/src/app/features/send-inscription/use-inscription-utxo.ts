import { useState } from 'react';

import {
  createBitcoinAddress,
  lookupDerivationByAddress,
} from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { BitcoinNetworkModes, InscriptionAsset } from '@leather.io/models';
import type { UtxoWithDerivationPath } from '@leather.io/query';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { createUtxoFromInscription } from '@app/pages/send/ordinal-inscription/components/create-utxo-from-inscription';

interface UseInscriptionUtxoArgs {
  inscription: InscriptionAsset;
  taprootXpub: string | undefined;
  nativeSegwitXpub: string | undefined;
  networkMode: BitcoinNetworkModes;
  accountIndex: number;
}

interface UseInscriptionUtxoResult {
  utxo: UtxoWithDerivationPath | null;
  error: string | null;
}

export function useInscriptionUtxo({
  inscription,
  taprootXpub,
  nativeSegwitXpub,
  networkMode,
  accountIndex,
}: UseInscriptionUtxoArgs): UseInscriptionUtxoResult {
  const [utxo, setUtxo] = useState<UtxoWithDerivationPath | null>(null);
  const [error, setError] = useState<string | null>(null);

  useOnMount(() => {
    if (!inscription) return;

    if (!taprootXpub || !nativeSegwitXpub) {
      setError('Missing account keychain data');
      return;
    }

    const inscriptionAddress = createBitcoinAddress(inscription.address);

    const result = lookupDerivationByAddress({
      taprootXpub,
      nativeSegwitXpub,
      iterationLimit: 100,
    })(inscriptionAddress);

    if (result.status !== 'success') {
      setError('Unable to find key of owner inscription address');
      return;
    }

    const addressIndex = extractAddressIndexFromPath(result.path);
    const changeIndex = extractChangeIndexFromPath(result.path);

    setUtxo(
      createUtxoFromInscription({
        inscription,
        network: networkMode,
        accountIndex,
        changeIndex,
        inscriptionAddressIdx: addressIndex,
      })
    );
  });

  return { utxo, error };
}
