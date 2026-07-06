import { useCallback } from 'react';

import { stringAsciiCV } from '@stacks/transactions';
import type * as bitcoin from 'bitcoinjs-lib';

import { createBitcoinAddress, signBip322MessageSimple } from '@leather.io/bitcoin';
import type { AuthNetworkId } from '@leather.io/models';
import type { SignProposalCommitment } from '@leather.io/services';
import { buildStxProposalDomain } from '@leather.io/stacks';

import type { UnsignedMessage } from '@shared/signature/signature-types';

import { useWalletType } from '@app/common/use-wallet-type';
import { listenForStacksMessageSigning } from '@app/features/ledger/flows/stacks-message-signing/stacks-message-signing-event-listeners';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { useMessageSignerStacksSoftwareWallet } from '@app/features/stacks-message-signer/stacks-message-signing.utils';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// Signs the multisig proposal commitment hash with the PARENT singlesig key — the
// cosigner key registered in the multisig. BTC uses BIP-322 p2wpkh, STX uses the
// SIP-018 structured message domain, mirroring the web Leather SDK signer.
export function useSignProposalCommitment(): SignProposalCommitment {
  const network = useCurrentNetwork();
  const networkMode = network.chain.bitcoin.mode;
  const { whenWallet } = useWalletType();
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const signBitcoinTx = useSignBitcoinTx();
  const signStacksMessage = useMessageSignerStacksSoftwareWallet();
  const ledgerNavigate = useLedgerNavigate();

  return useCallback<SignProposalCommitment>(
    async (authNetwork: AuthNetworkId, proposalHash: string) => {
      if (authNetwork.startsWith('btc')) {
        if (!createNativeSegwitPayer)
          throw new Error('No native segwit signer for the current account');
        const {
          payment: { address },
        } = createNativeSegwitPayer({ addressIndex: 0, changeIndex: 0 });
        const { signature } = await signBip322MessageSimple({
          message: proposalHash,
          address: createBitcoinAddress(address ?? ''),
          signPsbt: async (psbt: bitcoin.Psbt) => signBitcoinTx(psbt.toBuffer()),
          network: networkMode,
        });
        return signature;
      }

      const unsignedMessage: UnsignedMessage = {
        messageType: 'structured',
        message: stringAsciiCV(proposalHash),
        domain: buildStxProposalDomain(authNetwork),
      };

      return whenWallet({
        async software() {
          const signed = signStacksMessage(unsignedMessage);
          if (!signed) throw new Error('Unable to sign the multisig proposal commitment');
          return signed.signature;
        },
        async ledger() {
          void ledgerNavigate.toConnectAndSignStacksProposalStep(unsignedMessage);
          const { signature } = await listenForStacksMessageSigning(unsignedMessage);
          return signature;
        },
      })();
    },
    [
      whenWallet,
      createNativeSegwitPayer,
      signBitcoinTx,
      signStacksMessage,
      networkMode,
      ledgerNavigate,
    ]
  );
}
