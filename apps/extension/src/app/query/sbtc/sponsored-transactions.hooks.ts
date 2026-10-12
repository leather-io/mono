import { useEffect, useState } from 'react';

import type { StacksTransactionFees } from '@leather.io/models';

import { logger } from '@shared/logger';

import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useNextNonce } from '../stacks/nonce/account-nonces.hooks';
import {
  type SbtcSponsorshipEligibility,
  type SbtcSponsorshipVerificationResult,
  type TransactionBase,
  verifySponsoredSbtcTransaction,
} from './sponsored-transactions.query';

const sponsorshipApiUrlMainnet = 'https://sponsor.leather.io';
const sponsorshipApiUrlTestnet = 'https://sponsor-testnet.leather.io';

interface UseCheckSbtcSponsorshipEligibleProps {
  baseTx?: TransactionBase;
  stxFees?: StacksTransactionFees;
}
export function useCheckSbtcSponsorshipEligible({
  baseTx,
  stxFees,
}: UseCheckSbtcSponsorshipEligibleProps): SbtcSponsorshipVerificationResult {
  const network = useCurrentNetwork();
  const sponsorshipApiUrl =
    network.chain.bitcoin.mode === 'mainnet' ? sponsorshipApiUrlMainnet : sponsorshipApiUrlTestnet;
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<SbtcSponsorshipEligibility | undefined>();
  const [lastAddressChecked, setLastAddressChecked] = useState<string | undefined>();

  useEffect(() => {
    if (!(baseTx && nextNonce && stxFees)) {
      return;
    }
    if (result && stxAddress === lastAddressChecked) {
      return;
    }

    verifySponsoredSbtcTransaction({
      apiUrl: sponsorshipApiUrl,
      baseTx,
      nonce: nextNonce.nonce,
      fee: stxFees.options.standard.value.amount.toNumber(),
    })
      .then(result => {
        setResult(result);
        setLastAddressChecked(stxAddress);
      })
      .catch(e => {
        logger.error('Verification failure: ', e);
        setResult({ isEligible: false });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [baseTx, stxFees, result, stxAddress, lastAddressChecked, nextNonce, sponsorshipApiUrl]);

  return {
    isVerifying: isLoading,
    result,
  };
}
