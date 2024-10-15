//
import { BtcCryptoAssetBalance, StxCryptoAssetBalance } from '@leather.io/models';
import { inject, injectable } from 'inversify';
import { TYPES } from 'inversify-types';
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

@injectable()
export class AccountBalanceServiceImpl implements AccountBalanceService {
  constructor(
    @inject(TYPES.BtcBalanceService) private readonly _btcBalanceService: BtcBalanceService,
    @inject(TYPES.StxBalanceService) private readonly _stxBalanceService: StxBalanceService
  ) {}

  async getAccountBalance(accountIdentifiers: AccountIdentifiers) {
    return {
      btcBalance: await this._btcBalanceService.getBtcCompositeBalance(
        accountIdentifiers.btcDescriptors
      ),
      stxBalance: await this._stxBalanceService.getStxBalance(accountIdentifiers.stxAddress),
    };
  }
}
