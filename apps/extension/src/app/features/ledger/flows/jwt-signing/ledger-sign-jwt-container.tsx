import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router';

import { getAddressFromPublicKey } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';
import get from 'lodash.get';

import { Sheet, SheetHeader } from '@leather.io/ui';
import { delay, isError } from '@leather.io/utils';

import { finalizeAuthResponse } from '@shared/actions/finalize-auth-response';
import { logger } from '@shared/logger';
import { getHostnameFromUrl } from '@shared/utils/urls';

import { useGetLegacyAuthBitcoinAddresses } from '@app/common/authentication/use-legacy-auth-bitcoin-addresses';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { makeLedgerCompatibleUnsignedAuthResponsePayload } from '@app/common/unsafe-auth-response';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import {
  MINIMUM_STACKS_APP_VERSION,
  getStacksAppVersion,
  prepareLedgerDeviceStacksAppConnection,
  validateStacksAppVersion,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { appPermissionsSlice } from '@app/store/app-permissions/app-permissions.slice';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { checkLockedDeviceError, useLedgerResponseState } from '../../utils/generic-ledger-utils';
import {
  addSignatureToAuthResponseJwt,
  getSha256HashOfJwtAuthPayload,
  signLedgerJwtHash,
} from './jwt-signing.utils';
import { LedgerJwtSigningContext, LedgerJwtSigningProvider } from './ledger-sign-jwt.context';

export function LedgerSignJwtContainer() {
  const location = useLocation();
  const ledgerNavigate = useLedgerNavigate();
  useScrollLock(true);

  const account = useCurrentStacksAccount();
  const network = useCurrentStacksNetworkState();

  const getBitcoinAddressesLegacyFormat = useGetLegacyAuthBitcoinAddresses();

  const keyActions = useKeyActions();
  const dispatch = useDispatch();
  const currentNetwork = useCurrentNetwork();
  const { decodedAuthRequest, authRequest } = useOnboardingState();

  const [accountIndex, setAccountIndex] = useState<null | number>(null);

  useEffect(() => {
    const index = parseInt(get(location.state, 'index'), 10);
    if (Number.isFinite(index)) setAccountIndex(index);
  }, [location.state]);

  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();

  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  const [jwtPayloadHash, setJwtPayloadHash] = useState<null | string>(null);
  const { frameId, origin, tabId } = useDefaultRequestParams();

  const chain = 'stacks';

  async function signJwtPayload() {
    if (!origin || !account) throw new Error('Cannot sign payload for unknown origin');

    if (accountIndex === null) {
      logger.warn('No account index found');
      return;
    }

    if (!account || !decodedAuthRequest || !authRequest || !tabId) {
      logger.warn('No necessary state not found while performing JWT signing', {
        account: account,
        decodedAuthRequest,
        authRequest,
        tabId,
      });
      return;
    }

    if (!account) {
      logger.warn('No account for given index found');
      return;
    }

    const stacks = await prepareLedgerDeviceStacksAppConnection({
      setLoadingState: setAwaitingDeviceConnection,
      onError(e) {
        if (isError(e) && checkLockedDeviceError(e)) {
          setLatestDeviceResponse({ deviceLocked: true } as any);
          return;
        }
        void ledgerNavigate.toErrorStep(chain);
      },
    });

    try {
      const versionInfo = await getStacksAppVersion(stacks);
      setLatestDeviceResponse(versionInfo);

      if (versionInfo.deviceLocked) {
        setAwaitingDeviceConnection(false);
        return;
      }

      if (versionInfo.returnCode !== LedgerError.NoErrors) {
        logger.error('Return code from device has error', versionInfo);
        return;
      }

      const { meetsMinimum, currentVersion } = validateStacksAppVersion(versionInfo);
      if (!meetsMinimum) {
        void ledgerNavigate.toStacksAppOutdatedWarning({
          currentVersion,
          requiredVersion: MINIMUM_STACKS_APP_VERSION,
        });
        setAwaitingDeviceConnection(false);
        return;
      }

      // TODO: #4566 Low-grade code. This is to be removed when deprecating legacy APIs
      let legacyAddressObj = {};
      try {
        legacyAddressObj = getBitcoinAddressesLegacyFormat(accountIndex);
      } catch (e) {
        logger.error('Error while generating bitcoin addresses to return', e);
      }

      void ledgerNavigate.toConnectionSuccessStep('stacks');
      await delay(1000);

      const authResponsePayload = makeLedgerCompatibleUnsignedAuthResponsePayload({
        dataPublicKey: account.dataPublicKey,
        profile: {
          stxAddress: {
            testnet: getAddressFromPublicKey(account.stxPublicKey, network),
            mainnet: getAddressFromPublicKey(account.stxPublicKey, network),
          },
          ...legacyAddressObj,
        },
      });

      setJwtPayloadHash(getSha256HashOfJwtAuthPayload(authResponsePayload));

      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const resp = await signLedgerJwtHash(stacks)(authResponsePayload, accountIndex);

      if (resp.returnCode === LedgerError.TransactionRejected) {
        void ledgerNavigate.toOperationRejectedStep();
        return;
      }

      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
      const authResponse = addSignatureToAuthResponseJwt(authResponsePayload, resp.signatureDER);
      await delay(600);
      keyActions.switchAccount({ fingerprint: account.fingerprint, accountIndex });

      dispatch(
        appPermissionsSlice.actions.updatePermission({
          origin: getHostnameFromUrl(origin),
          fingerprint: account.fingerprint,
          accountIndex,
          requestedAccounts: new Date().toISOString(),
          networkMode: currentNetwork.chain.bitcoin.mode,
        })
      );

      finalizeAuthResponse({
        decodedAuthRequest,
        frameId,
        authRequest,
        authResponse,
        requestingOrigin: origin,
        tabId,
      });
    } catch {
      void ledgerNavigate.toDeviceDisconnectStep();
    } finally {
      try {
        await stacks.transport.close();
      } catch (e) {
        logger.error('Error closing transport after JWT signing', e);
      }
    }
  }

  const onCancelConnectLedger = ledgerNavigate.cancelLedgerAction;

  const ledgerContextValue: LedgerJwtSigningContext = {
    signJwtPayload,
    jwtPayloadHash,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);

  return (
    <LedgerJwtSigningProvider value={ledgerContextValue}>
      <Sheet
        isShowing
        header={<SheetHeader />}
        onClose={canCancelLedgerAction ? () => onCancelConnectLedger() : undefined}
      >
        <Outlet />
      </Sheet>
    </LedgerJwtSigningProvider>
  );
}
