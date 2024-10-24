import { BtcCryptoAssetBalance, StxCryptoAssetBalance } from '@leather.io/models';

import type { BtcBalanceService } from './bitcoin/btc-balance.service';
import type { StxBalanceService } from './stacks/stx-balance.service';

export interface AccountBalance {
  btcBalance: BtcCryptoAssetBalance;
  stxBalance: StxCryptoAssetBalance;
}

export interface AccountIdentifiers {
  btcDescriptors: string[];
  stxAddress: string;
}

export interface AccountBalanceService {
  getAccountBalance(accountIdentifiers: AccountIdentifiers): Promise<AccountBalance>;
}

export function createAccountBalanceService(
  btcBalanceService: BtcBalanceService,
  stxBalanceService: StxBalanceService
): AccountBalanceService {
  async function getAccountBalance(accountIdentifiers: AccountIdentifiers) {
    return {
      btcBalance: await btcBalanceService.getBtcCompositeBalance(accountIdentifiers.btcDescriptors),
      stxBalance: await stxBalanceService.getStxBalance(accountIdentifiers.stxAddress),
    };
  }
  return {
    getAccountBalance,
  };
}
