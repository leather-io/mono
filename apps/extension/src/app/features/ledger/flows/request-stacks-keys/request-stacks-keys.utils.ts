import { bytesToHex } from '@noble/hashes/utils';
import * as secp from '@noble/secp256k1';
import StacksApp from '@zondax/ledger-stacks';

import {
  makeStacksAccountDerivationPath,
  makeStacksAccountLedgerCompatibleDerivationPath,
} from '@leather.io/stacks';
import { delay } from '@leather.io/utils';

import { getIdentityDerivationPath } from '@shared/crypto/stacks/stacks-address-gen';

import { defaultNumberOfKeysToPullFromLedgerDevice } from '../../generic-flows/request-keys/use-request-ledger-keys';
import {
  StacksAppKeysResponseItem,
  requestPublicKeyForStxAccount,
} from '../../utils/stacks-ledger-utils';

function requestPublicKeyForIdentityAccount(app: StacksApp) {
  return async (index: number) => app.getIdentityPubKey(getIdentityDerivationPath(index));
}

function decompressSecp256k1PublicKey(publicKey: string) {
  const point = secp.ProjectivePoint.fromHex(publicKey);
  return bytesToHex(point.toRawBytes(false));
}

interface PullStacksKeysFromLedgerSuccess {
  status: 'success';
  publicKeys: StacksAppKeysResponseItem[];
}

interface PullStacksKeysFromLedgerFailure {
  status: 'failure';
  errorMessage: string;
  returnCode: number;
}

type PullStacksKeysFromLedgerResponse = Promise<
  PullStacksKeysFromLedgerSuccess | PullStacksKeysFromLedgerFailure
>;

interface PullStacksKeysFromLedgerDeviceArgs {
  onRequestKey?(keyIndex: number): void;
}
export function pullStacksKeysFromLedgerDevice(stacksApp: StacksApp) {
  return async ({
    onRequestKey,
  }: PullStacksKeysFromLedgerDeviceArgs): PullStacksKeysFromLedgerResponse => {
    const publicKeys = [];

    for (let index = 0; index < defaultNumberOfKeysToPullFromLedgerDevice; index++) {
      if (onRequestKey) onRequestKey(index);
      const stacksAccountPath = makeStacksAccountDerivationPath(index);
      const stacksPublicKeyResp = await requestPublicKeyForStxAccount(stacksApp)(stacksAccountPath);

      const stacksLedgerCompatibleAccountPath =
        makeStacksAccountLedgerCompatibleDerivationPath(index);
      const stacksLedgerCompatiblePublicKeyResp = await requestPublicKeyForStxAccount(stacksApp)(
        stacksLedgerCompatibleAccountPath
      );

      const dataPublicKeyResp = await requestPublicKeyForIdentityAccount(stacksApp)(index);

      if (!stacksPublicKeyResp.publicKey) return { status: 'failure', ...stacksPublicKeyResp };
      if (!stacksLedgerCompatiblePublicKeyResp.publicKey)
        return { status: 'failure', ...stacksLedgerCompatiblePublicKeyResp };
      if (!dataPublicKeyResp.publicKey) return { status: 'failure', ...dataPublicKeyResp };

      // We return a decompressed public key, to match the behaviour of
      // @stacks/wallet-sdk. I'm not sure why we return an uncompressed key
      // typically compressed keys are used
      const dataPublicKey = decompressSecp256k1PublicKey(
        dataPublicKeyResp.publicKey.toString('hex')
      );

      publicKeys.push({
        path: stacksAccountPath,
        stxPublicKey: stacksPublicKeyResp.publicKey.toString('hex'),
        dataPublicKey,
      });
      publicKeys.push({
        path: stacksLedgerCompatibleAccountPath,
        stxPublicKey: stacksLedgerCompatiblePublicKeyResp.publicKey.toString('hex'),
        dataPublicKey,
      });
    }
    await delay(1000);

    return { status: 'success', publicKeys };
  };
}
