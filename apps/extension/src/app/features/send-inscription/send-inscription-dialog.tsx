import { useState } from 'react';

import type { InscriptionAsset } from '@leather.io/models';

import { useAverageBitcoinFeeRates } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useNumberOfInscriptionsOnUtxo } from '@app/query/bitcoin/ordinals/inscriptions/inscriptions.query';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentTaprootAccount } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { SendInscriptionForm } from './send-inscription-form';
import {
  SendInscriptionErrorState,
  SendInscriptionLoadingState,
  SendInscriptionSuccessState,
} from './send-inscription-sheet.layout';
import { useInscriptionUtxo } from './use-inscription-utxo';
import { useSendInscriptionValidation } from './use-send-inscription-validation';

interface SendInscriptionDialogProps {
  inscription: InscriptionAsset;
  isOpen: boolean;
  onClose(): void;
}

type DialogStep = 'form' | 'success' | 'error';

export function SendInscriptionDialog({
  inscription,
  isOpen,
  onClose,
}: SendInscriptionDialogProps) {
  const [step, setStep] = useState<DialogStep>('form');
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const network = useCurrentNetwork();
  const currentAccountIndex = useCurrentAccountIndex();
  const taprootAccount = useCurrentTaprootAccount();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const { data: feeRates } = useAverageBitcoinFeeRates();
  const { refetchUtxos } = useCurrentNativeSegwitUtxos();
  const getNumberOfInscriptionOnUtxo = useNumberOfInscriptionsOnUtxo();

  const { utxo, error: utxoError } = useInscriptionUtxo({
    inscription,
    taprootXpub: taprootAccount?.keychain.publicExtendedKey,
    nativeSegwitXpub: nativeSegwitAccount?.keychain.publicExtendedKey,
    networkMode: network.chain.bitcoin.mode,
    accountIndex: currentAccountIndex,
  });

  const validationSchema = useSendInscriptionValidation(network.chain.bitcoin.mode);

  if (!isOpen) return null;

  // Loading state
  if (!feeRates || !utxo) {
    return <SendInscriptionLoadingState error={utxoError || currentError} onClose={onClose} />;
  }

  // Success state
  if (step === 'success') {
    return <SendInscriptionSuccessState txid={txid} onClose={onClose} />;
  }

  // Error state
  if (step === 'error') {
    return (
      <SendInscriptionErrorState
        error={currentError}
        onRetry={() => {
          setStep('form');
          setCurrentError(null);
        }}
        onClose={onClose}
      />
    );
  }

  // Form state
  return (
    <SendInscriptionForm
      inscription={inscription}
      utxo={utxo}
      feeRate={feeRates.hourFee.toNumber()}
      validationSchema={validationSchema}
      currentError={currentError}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSuccess={(resultTxid: string) => {
        setTxid(resultTxid);
        setStep('success');
        setIsSubmitting(false);
      }}
      onError={(error: string) => {
        setCurrentError(error);
        setStep('error');
        setIsSubmitting(false);
      }}
      refetchUtxos={refetchUtxos}
      getNumberOfInscriptionOnUtxo={getNumberOfInscriptionOnUtxo}
    />
  );
}
