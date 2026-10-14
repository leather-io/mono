import { useMemo, useState } from 'react';

import type * as btc from '@scure/btc-signer';
import type * as bitcoin from 'bitcoinjs-lib';

import { createBitcoinAddress } from '@leather.io/bitcoin';
import { type BitcoinAddress } from '@leather.io/models';
import { RpcErrorCode, createRpcErrorResponse, createRpcSuccessResponse } from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { closeWindow, createDelay } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { signBip322MessageUnlessDismissed } from '@app/common/sign-bip322-message-unless-dismissed';
import { isLedgerSigningCancelledError } from '@app/features/ledger/flow/unwrap-ledger-signing-outcome';
import { useToast } from '@app/features/toasts/use-toast';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

function useRpcSignBitcoinMessage() {
  const defaultParams = useDefaultRequestParams();
  return useMemo(
    () => ({
      ...defaultParams,
      requestId: initialSearchParams.get('requestId') ?? '',
      message: initialSearchParams.get('message') ?? '',
      paymentType: initialSearchParams.get('paymentType') ?? 'p2wpkh',
    }),
    [defaultParams]
  );
}

const shortPauseBeforeToast = createDelay(250);
const allowTimeForUserToReadToast = createDelay(1200);

interface Bip322Signer {
  address: BitcoinAddress;
  signPsbt(a: bitcoin.Psbt): Promise<btc.Transaction | null>;
}
function useSignBip322MessageFactory(signer: Bip322Signer | null) {
  const network = useCurrentNetwork();
  const networkMode = network.chain.bitcoin.mode;

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { frameId, tabId, origin, requestId, message, paymentType } = useRpcSignBitcoinMessage();

  return {
    origin,
    message,
    networkMode,
    isLoading,
    paymentType,
    address: signer?.address,
    onSignerUnavailable() {
      if (tabId) {
        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcErrorResponse('signMessage', {
            id: requestId,
            error: {
              code: RpcErrorCode.INVALID_REQUEST,
              message: `The current account cannot sign ${paymentType} messages`,
            },
          })
        );
      }
      closeWindow();
    },
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
      if (!signer) return;
      setIsLoading(true);

      if (!tabId || !origin) {
        logger.error('Cannot give app accounts: missing tabId, origin');
        return;
      }

      try {
        const signed = await signBip322MessageUnlessDismissed({
          message,
          address: signer.address,
          signPsbt: signer.signPsbt,
          network: networkMode,
        });
        if (!signed) return;
        const { signature } = signed;

        await shortPauseBeforeToast();
        toast.success('Message signed successfully');

        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcSuccessResponse('signMessage', {
            id: requestId,
            result: { signature, address: signer.address, message },
          })
        );

        analytics.track('user_approved_message_signing', { origin });

        await allowTimeForUserToReadToast();
        closeWindow();
      } catch (e) {
        if (isLedgerSigningCancelledError(e)) return;
        logger.error('Unable to sign bip322 message', e);
        toast.error('Unable to sign message');
      } finally {
        setIsLoading(false);
      }
    },
  };
}

function useBip322Signer(paymentType: string): Bip322Signer | null {
  const createTaprootPayer = useCurrentAccountTaprootPayer();
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const sign = useSignBitcoinTx();

  switch (paymentType) {
    case 'p2tr': {
      if (!createTaprootPayer) return null;
      const {
        payment: { tapInternalKey, address },
      } = createTaprootPayer({ addressIndex: 0, changeIndex: 0 });
      if (!address) return null;
      return {
        address: createBitcoinAddress(address),
        async signPsbt(psbt) {
          psbt.data.inputs.forEach(input => (input.tapInternalKey = Buffer.from(tapInternalKey)));
          return sign(psbt.toBuffer());
        },
      };
    }
    case 'p2wpkh': {
      if (!createNativeSegwitPayer) return null;
      const {
        payment: { address },
      } = createNativeSegwitPayer({ addressIndex: 0, changeIndex: 0 });
      if (!address) return null;
      return {
        address: createBitcoinAddress(address),
        async signPsbt(psbt) {
          return sign(psbt.toBuffer());
        },
      };
    }
    default:
      return null;
  }
}

export function useSignBip322Message() {
  const { paymentType } = useRpcSignBitcoinMessage();
  return useSignBip322MessageFactory(useBip322Signer(paymentType));
}
