import { useCallback } from 'react';

import { stringAsciiCV } from '@stacks/transactions';
import type * as bitcoin from 'bitcoinjs-lib';

import { createBitcoinAddress } from '@leather.io/bitcoin';
import type { AuthNetworkId } from '@leather.io/models';
import { buildStxProposalDomain } from '@leather.io/stacks';

import type { UnsignedMessage } from '@shared/signature/signature-types';

import { signBip322MessageUnlessDismissed } from '@app/common/sign-bip322-message-unless-dismissed';
import { useWalletType } from '@app/common/use-wallet-type';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import { unwrapLedgerSigningOutcome } from '@app/features/ledger/flow/unwrap-ledger-signing-outcome';
import { useMessageSignerStacksSoftwareWallet } from '@app/features/stacks-message-signer/stacks-message-signing.utils';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// Signs the multisig proposal commitment hash with the PARENT singlesig key — the
// cosigner key registered in the multisig. BTC uses BIP-322 p2wpkh, STX uses the
// SIP-018 structured message domain, mirroring the web Leather SDK signer.
export function useSignProposalCommitment() {
  const network = useCurrentNetwork();
  const networkMode = network.chain.bitcoin.mode;
  const stacksChainId = network.chain.stacks.subnetChainId ?? network.chain.stacks.chainId;
  const { whenWallet } = useWalletType();
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const signBitcoinTx = useSignBitcoinTx();
  const signStacksMessage = useMessageSignerStacksSoftwareWallet();
  const { sign: signWithLedger } = useLedgerFlow();

  return useCallback(
    async (authNetwork: AuthNetworkId, proposalHash: string): Promise<string | null> => {
      if (authNetwork.startsWith('btc')) {
        if (!createNativeSegwitPayer)
          throw new Error('No native segwit signer for the current account');
        const {
          payment: { address },
        } = createNativeSegwitPayer({ addressIndex: 0, changeIndex: 0 });
        if (!address) throw new Error('No native segwit address for the current account');
        const signed = await signBip322MessageUnlessDismissed({
          message: proposalHash,
          address: createBitcoinAddress(address),
          signPsbt: async (psbt: bitcoin.Psbt) => signBitcoinTx(psbt.toBuffer()),
          network: networkMode,
        });
        return signed?.signature ?? null;
      }

      const unsignedMessage: UnsignedMessage = {
        messageType: 'structured',
        message: stringAsciiCV(proposalHash),
        domain: buildStxProposalDomain(stacksChainId),
      };

      return whenWallet({
        software() {
          const signed = signStacksMessage(unsignedMessage);
          if (!signed) throw new Error('Unable to sign the multisig proposal commitment');
          return signed.signature;
        },
        async ledger() {
          const outcome = await signWithLedger({
            kind: 'sign-stacks-message',
            message: unsignedMessage,
          });
          return unwrapLedgerSigningOutcome(outcome)?.signature ?? null;
        },
      })();
    },
    [
      whenWallet,
      createNativeSegwitPayer,
      signBitcoinTx,
      signStacksMessage,
      networkMode,
      stacksChainId,
      signWithLedger,
    ]
  );
}
