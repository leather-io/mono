import { injectable } from 'inversify';

import { Money } from '@leather.io/models';
import { isDefined, sumMoney } from '@leather.io/utils';

import { AccountRequest } from '../types';
import { BtcBalancesService } from './btc-balances.service';
import { Sip10BalancesService } from './sip10-balances.service';
import { StxBalancesService } from './stx-balances.service';

@injectable()
export class AccountBalancesService {
  constructor(
    private readonly btcBalancesService: BtcBalancesService,
    private readonly stxBalancesService: StxBalancesService,
    private readonly sip10BalancesService: Sip10BalancesService
  ) {}

  public async getAvailableBalance(request: AccountRequest, signal?: AbortSignal): Promise<Money> {
    const [btcBalance, stxBalance, sip10Balance] = await Promise.all([
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
    ]);
    const accountBalance = sumMoney(
      [
        btcBalance.quote.availableBalance,
        stxBalance.quote.availableBalance,
        sip10Balance.quote.availableBalance,
      ].filter(isDefined)
    );
    return accountBalance;
  }

  public async getTotalBalance(request: AccountRequest, signal?: AbortSignal): Promise<Money> {
    const [btcBalance, stxBalance, sip10Balance] = await Promise.all([
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
    ]);
    const accountBalance = sumMoney(
      [
        btcBalance.quote.totalBalance,
        stxBalance.quote.totalBalance,
        sip10Balance.quote.totalBalance,
      ].filter(isDefined)
    );
    return accountBalance;
  }

  public async getUnlockedBalance(request: AccountRequest, signal?: AbortSignal): Promise<Money> {
    const [btcBalance, stxBalance, sip10Balance] = await Promise.all([
      this.btcBalancesService.getBtcAccountBalance(request, signal),
      this.stxBalancesService.getStxAccountBalance(request, signal),
      this.sip10BalancesService.getSip10AccountBalance(request, signal),
    ]);
    const accountBalance = sumMoney(
      [
        btcBalance.quote.availableBalance,
        stxBalance.quote.availableUnlockedBalance,
        sip10Balance.quote.availableBalance,
      ].filter(isDefined)
    );
    return accountBalance;
  }
}
