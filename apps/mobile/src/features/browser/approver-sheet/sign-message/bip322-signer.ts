import { signTx } from '@/features/psbt-signer/signer';
import { NetworkState } from '@/queries/leather-query-provider';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { destructAccountIdentifier } from '@/store/utils';
import * as bitcoin from 'bitcoinjs-lib';

import {
  payerToBip32DerivationBitcoinJsLib,
  payerToTapBip32DerivationBitcoinJsLib,
  signBip322MessageSimple,
} from '@leather.io/bitcoin';
import { RpcRequest, RpcResult, signMessage } from '@leather.io/rpc';

interface SignBip322MessageArgs {
  message: RpcRequest<typeof signMessage>;
  accountId: string;
  accountIndexByPaymentType: ReturnType<typeof useBitcoinAccounts>['accountIndexByPaymentType'];
  network: NetworkState;
}

export async function signBip322Message({
  message,
  accountId,
  network,
  accountIndexByPaymentType,
}: SignBip322MessageArgs): Promise<RpcResult<typeof signMessage>> {
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);

  const { nativeSegwit, taproot } = accountIndexByPaymentType(fingerprint, accountIndex);

  if (!nativeSegwit || !taproot) throw new Error('No signer found');

  switch (message.params.paymentType) {
    case 'p2tr': {
      const taprootPayer = taproot.derivePayer({ addressIndex: 0 });

      const { signature } = await signBip322MessageSimple({
        message: message.params.message,
        address: taprootPayer.address,
        network: network.chain.bitcoin.mode,
        signPsbt(psbt: bitcoin.Psbt) {
          psbt.data.inputs.forEach((_, idx) => {
            psbt.updateInput(idx, {
              tapInternalKey: Buffer.from(taprootPayer.payment.tapInternalKey),
              tapBip32Derivation: [payerToTapBip32DerivationBitcoinJsLib(taprootPayer)],
            });
          });
          return signTx(psbt.toBuffer());
        },
      });

      return {
        signature,
        address: taprootPayer.address,
      };
    }
    case 'p2wpkh': {
      const nativeSegwitPayer = nativeSegwit.derivePayer({ addressIndex: 0 });

      const { signature } = await signBip322MessageSimple({
        message: message.params.message,
        address: nativeSegwitPayer.address,
        network: network.chain.bitcoin.mode,
        signPsbt(psbt: bitcoin.Psbt) {
          psbt.data.inputs.forEach((_, idx) => {
            psbt.updateInput(idx, {
              bip32Derivation: [payerToBip32DerivationBitcoinJsLib(nativeSegwitPayer)],
            });
          });
          return signTx(psbt.toBuffer());
        },
      });
      return {
        signature,
        address: nativeSegwitPayer.address,
      };
    }
    default:
      throw new Error('Only supports p2tr and p2wpkh bip322 message signing');
  }
}
