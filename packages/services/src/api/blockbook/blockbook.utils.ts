import { BtcCryptoAssetBalance, DefaultNetworkConfigurations, Utxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { BlockbookBalance, BlockbookUtxo } from './blockbook.client';

export const BLOCKBOOK_API_BASE_URL_MAINNET =
  'https://delicate-bitter-tent.btc.quiknode.pro/f2ee754a95c4202b8dba208a68f7d1f75b2acc5f/api/v2';
export const BLOCKBOOK_API_BASE_URL_TESTNET =
  'https://delicate-bitter-tent.btc.quiknode.pro/f2ee754a95c4202b8dba208a68f7d1f75b2acc5f/api/v2';

export function getBlockbookBaseUrl(networkId: string) {
  switch (networkId as DefaultNetworkConfigurations) {
    case 'testnet':
      return BLOCKBOOK_API_BASE_URL_TESTNET;
    default:
      return BLOCKBOOK_API_BASE_URL_MAINNET;
  }
}

export function getBlockbookUtxoUrl(descriptor: string, networkId: string) {
  return [getBlockbookBaseUrl(networkId), 'utxo', descriptor].join('/');
}

export function getBlockbookBalanceUrl(descriptor: string, networkId: string) {
  return [getBlockbookBaseUrl(networkId), 'xpub', descriptor].join('/');
}

export function mapBlockbookBalance(blockbookBalance: BlockbookBalance): BtcCryptoAssetBalance {
  return {
    availableBalance: createMoney(Number(blockbookBalance.balance), 'USD'),
    protectedBalance: createMoney(0, 'USD'),
    uneconomicalBalance: createMoney(0, 'USD'),
  };
}

export function mapBlockbookUtxo(blockbookUtxo: BlockbookUtxo): Utxo {
  return {
    ...blockbookUtxo,
  };
}
