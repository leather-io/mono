import { injectable } from 'inversify';

import { Money } from '@leather.io/models';
import { isDefined, sumMoney } from '@leather.io/utils';

import { AccountRequest } from '../types';
import { BtcBalancesService } from './btc-balances.service';
import { RunesBalancesService } from './runes-balances.service';
import { Sip10BalancesService } from './sip10-balances.service';
import { StxBalancesService } from './stx-balances.service';

@injectable()
export class AccountBalancesService {
  constructor(
    private readonly btcBalancesService: BtcBalancesService,
    private readonly stxBalancesService: StxBalancesService,
    private readonly sip10BalancesService: Sip10BalancesService,
    private readonly runesBalancesService: RunesBalancesService
  ) {}

  public async getTotalBalance(request: AccountRequest, signal?: AbortSignal): Promise<Money> {
    const [btcBalance, stxBalance, sip10Balance, runesBalance] = await Promise.all([
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
      this.runesBalancesService.getRunesAccountBalance(request, signal),
    ]);
    const accountBalance = sumMoney(
      [
        btcBalance.quote.availableBalance,
        stxBalance.quote.availableBalance,
        sip10Balance.quote.availableBalance,
        runesBalance.quote.availableBalance,
      ].filter(isDefined)
    );
    return accountBalance;
  }

  public async getUnlockedBalance(request: AccountRequest, signal?: AbortSignal): Promise<Money> {
    const [btcBalance, stxBalance, sip10Balance, runesBalance] = await Promise.all([
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
      this.runesBalancesService.getRunesAccountBalance(request, signal),
    ]);
    const accountBalance = sumMoney(
      [
        btcBalance.quote.availableBalance,
        stxBalance.quote.availableUnlockedBalance,
        sip10Balance.quote.availableBalance,
        runesBalance.quote.availableBalance,
      ].filter(isDefined)
    );
    return accountBalance;
  }
}
