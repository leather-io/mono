import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import type {
  AccountAddresses,
  StackingDaoStStxPosition,
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
export class StackingDaoStStxService implements YieldProductService {
  providerKey: StacksProtocolId = 'stacking-dao';
  productKey: YieldProductKey = 'stackingdao-ststx';
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
      name: 'Stacking DAO stSTX',
      url: '',
    });
  }

  async getAccountPositions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<StackingDaoStStxPosition[]> {
    if (!account.stacks) {
      return [];
    }

    const [ftBalances, nftHoldings] = await Promise.all([
      this.hiroStacksApiClient.getAddressFtBalances(account.stacks.stxAddress, { signal }),
      this.hiroStacksApiClient.getNftHoldings(
        account.stacks.stxAddress,
        { allPages: true, stopAfter: 5 },
        { signal }
      ),
    ]);

    const [ststxHolding, withdrawals] = await Promise.all([
      this.stackingDaoLstService.getLstHolding('ststx', ftBalances, signal),
      this.stackingDaoLstService.getLstWithdrawals('ststx', nftHoldings, signal),
    ]);

    if (!ststxHolding && withdrawals.length === 0) {
      return [];
    }

    const withdrawalsBalance = withdrawals.length
      ? sumMoney(withdrawals.map(withdrawal => withdrawal.balanceQuote))
      : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return [
      {
        id: this.productKey,
        provider: 'stacking-dao',
        product: 'stackingdao-ststx',
        totalBalance: sumMoney(
          [ststxHolding?.balanceQuote, withdrawalsBalance].filter(isNonNullish)
        ),
        apy: ststxHolding?.apy ?? 0,
        withdrawalsBalance,
        lstHolding: ststxHolding,
        withdrawals,
      },
    ];
  }
}
