import { useMemo, useState } from 'react';

import * as btc from '@scure/btc-signer';
import * as bitcoin from 'bitcoinjs-lib';

import { createBitcoinAddress, signBip322MessageSimple } from '@leather.io/bitcoin';
import { BitcoinAddress } from '@leather.io/models';
import {
  PaymentTypes,
  RpcErrorCode,
  createRpcErrorResponse,
  createRpcSuccessResponse,
} from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { closeWindow, createDelay } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { useToast } from '@app/features/toasts/use-toast';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import {
  useCurrentAccountNativeSegwitPayer,
  useCurrentNativeSegwitAccount,
} from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import {
  useCurrentAccountTaprootPayer,
  useCurrentTaprootAccount,
} from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

function useRpcSignBitcoinMessage() {
  const defaultParams = useDefaultRequestParams();
  return useMemo(
    () => ({
      ...defaultParams,
      requestId: initialSearchParams.get('requestId') ?? '',
      message: initialSearchParams.get('message') ?? '',
      paymentType: (initialSearchParams.get('paymentType') ?? 'p2wpkh') as Extract<
        'p2tr' | 'p2wpkh',
        PaymentTypes
      >,
    }),
    [defaultParams]
  );
}

const shortPauseBeforeToast = createDelay(250);
const allowTimeForUserToReadToast = createDelay(1200);

interface SignBip322MessageFactoryArgs {
  address: BitcoinAddress;
  signPsbt(a: bitcoin.Psbt): Promise<btc.Transaction>;
}
function useSignBip322MessageFactory({ address, signPsbt }: SignBip322MessageFactoryArgs) {
  const network = useCurrentNetwork();
  const networkMode = network.chain.bitcoin.mode;

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { frameId, tabId, origin, requestId, message } = useRpcSignBitcoinMessage();

  return {
    origin,
    message,
    networkMode,
    isLoading,
    formattedOrigin: new URL(origin ?? '').host,
    address,
    onUserRejectBip322MessageSigningRequest() {
      if (!tabId) return;
      void sendMessageToOriginatingFrame(
        { frameId, tabId },
        createRpcErrorResponse('signMessage', {
          id: requestId,
          error: {
            code: RpcErrorCode.USER_REJECTION,
            message: 'User rejected request',
          },
        })
      );
      closeWindow();
    },
    async onUserApproveBip322MessageSigningRequest() {
      setIsLoading(true);

      if (!tabId || !origin) {
        logger.error('Cannot give app accounts: missing tabId, origin');
        return;
      }

      const { signature } = await signBip322MessageSimple({
        message,
        address,
        signPsbt,
        network: networkMode,
      });

      await shortPauseBeforeToast();
      toast.success('Message signed successfully');

      void sendMessageToOriginatingFrame(
        { frameId, tabId },
        createRpcSuccessResponse('signMessage', {
          id: requestId,
          result: { signature, address, message },
        })
      );

      analytics.track('user_approved_message_signing', { origin });

      await allowTimeForUserToReadToast();
      closeWindow();
    },
  };
}

function useSignBip322MessageTaproot() {
  const createTaprootPayer = useCurrentAccountTaprootPayer();
  if (!createTaprootPayer) throw new Error('No taproot signer for current account');
  const currentTaprootAccount = useCurrentTaprootAccount();
  if (!currentTaprootAccount) throw new Error('No keychain for current account');
  const sign = useSignBitcoinTx();
  const payer = createTaprootPayer({ addressIndex: 0, changeIndex: 0 });

  const {
    payment: { tapInternalKey, address },
  } = payer;

  async function signPsbt(psbt: bitcoin.Psbt) {
    psbt.data.inputs.forEach(input => (input.tapInternalKey = Buffer.from(tapInternalKey)));
    return sign(psbt.toBuffer());
  }
  const signerAddress = createBitcoinAddress(address ?? '');
  return useSignBip322MessageFactory({ address: signerAddress, signPsbt });
}

function useSignBip322MessageNativeSegwit() {
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  if (!createNativeSegwitPayer) throw new Error('No native segwit signer for current account');

  const currentNativeSegwitAccount = useCurrentNativeSegwitAccount();
  if (!currentNativeSegwitAccount) throw new Error('No keychain for current account');
  const sign = useSignBitcoinTx();

  const {
    payment: { address },
  } = createNativeSegwitPayer({ addressIndex: 0, changeIndex: 0 });

  async function signPsbt(psbt: bitcoin.Psbt) {
    return sign(psbt.toBuffer());
  }

  return useSignBip322MessageFactory({
    address: createBitcoinAddress(address ?? ''),
    signPsbt,
  });
}

export function useSignBip322Message() {
  const { paymentType } = useRpcSignBitcoinMessage();

  const taprootMsgPayer = useSignBip322MessageTaproot();
  const nativeSegwitMsgPayer = useSignBip322MessageNativeSegwit();

  switch (paymentType) {
    case 'p2tr':
      return taprootMsgPayer;
    case 'p2wpkh':
      return nativeSegwitMsgPayer;
    default:
      throw new Error(`Unsupported payment type: ${paymentType}`);
  }
}
