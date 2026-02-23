import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import type {
  AccountAddresses,
  StackingDaoStStxBtcPosition,
  StacksProtocol,
  StacksProtocolId,
  YieldProduct,
  YieldProductCategory,
  YieldProductKey,
} from '@leather.io/models';
import { createMoney, sumMoney } from '@leather.io/utils';

import { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type { SettingsService } from '../../../infrastructure/settings/settings.service';
import { Types } from '../../../inversify.types';
import { YieldProductService } from '../../yield.service';
import { StackingDaoLstService } from './stacking-dao-lst.service';

@injectable()
export class StackingDaoStStxBtcService implements YieldProductService {
  providerKey: StacksProtocolId = 'stacking-dao';
  productKey: YieldProductKey = 'stackingdao-ststxbtc';
  productCategory: YieldProductCategory = 'liquid-stacking';

  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly stackingDaoLstService: StackingDaoLstService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  getProvider(): Promise<StacksProtocol> {
    return Promise.resolve({
      id: this.providerKey,
      name: 'Stacking DAO',
      logo: '',
      url: '',
    });
  }

  getProduct(): Promise<YieldProduct> {
    return Promise.resolve({
      key: this.productKey,
      provider: this.providerKey,
      category: this.productCategory,
      name: 'Stacking DAO stSTXBTC',
      url: '',
    });
  }

  async getAccountPositions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<StackingDaoStStxBtcPosition[]> {
    if (!account.stacks) {
      return [];
    }

    const [ftBalances, nftHoldings, sbtcReward] = await Promise.all([
      this.hiroStacksApiClient.getAddressFtBalances(account.stacks.stxAddress, { signal }),
      this.hiroStacksApiClient.getNftHoldings(account.stacks.stxAddress, { signal }),
      this.stackingDaoLstService.getSbtcReward(account.stacks.stxAddress, signal),
    ]);

    const [ststxbtcHolding, withdrawals] = await Promise.all([
      this.stackingDaoLstService.getLstHolding('ststxbtc', ftBalances, signal),
      this.stackingDaoLstService.getLstWithdrawals('ststxbtc', nftHoldings, signal),
    ]);

    if (!ststxbtcHolding && withdrawals.length === 0 && !sbtcReward) {
      return [];
    }

    const withdrawalsBalance = withdrawals.length
      ? sumMoney(withdrawals.map(withdrawal => withdrawal.balanceQuote))
      : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return [
      {
        id: this.productKey,
        provider: 'stacking-dao',
        product: 'stackingdao-ststxbtc',
        totalBalance: sumMoney(
          [ststxbtcHolding?.balanceQuote, withdrawalsBalance, sbtcReward?.balanceQuote].filter(
            isNonNullish
          )
        ),
        apy: ststxbtcHolding?.apy ?? 0,
        withdrawalsBalance,
        lstHolding: ststxbtcHolding,
        withdrawals,
        sbtcReward,
      },
    ];
  }
}
