import { App } from '@/store/apps/utils';

import { RpcRequest, stxSignTransaction } from '@leather.io/rpc';

export function getNormalizedParams(message: RpcRequest<typeof stxSignTransaction>, app: App) {
  function getAccountId() {
    if (app.status !== 'connected') throw new Error('We should always have an accountId here');

    return app.accountId;
  }

  function getTxHex() {
    if ('txHex' in message.params) {
      return message.params.txHex;
    }
    return message.params.transaction;
  }

  return { accountId: getAccountId(), txHex: getTxHex() };
}
