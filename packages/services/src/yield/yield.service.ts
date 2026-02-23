import { injectable } from 'inversify';

import type {
  AccountAddresses,
  StacksProtocol,
  StacksProtocolId,
  YieldPosition,
  YieldProduct,
  YieldProductCategory,
  YieldProductKey,
} from '@leather.io/models';

import { BitflowAmmLpService } from './providers/bitflow/bitflow-amm-lp.service';
import { GraniteV1BorrowService } from './providers/granite/granite-v1-borrow.service';
import { GraniteV1EarnService } from './providers/granite/granite-v1-earn.service';
import { StackingDaoStStxService } from './providers/stacking-dao/stacking-dao-ststx.service';
import { StackingDaoStStxBtcService } from './providers/stacking-dao/stacking-dao-ststxbtc.service';
import { ZestBorrowService } from './providers/zest/zest-borrow.service';

export interface YieldProductService {
  providerKey: StacksProtocolId;
  productKey: YieldProductKey;
  productCategory: YieldProductCategory;

  getProvider(signal?: AbortSignal): Promise<StacksProtocol>;
  getProduct(signal?: AbortSignal): Promise<YieldProduct>;
  getAccountPositions(account: AccountAddresses, signal?: AbortSignal): Promise<YieldPosition[]>;
}

@injectable()
export class YieldService {
  constructor(
    private readonly bitflowAmmLpService: BitflowAmmLpService,
    private readonly graniteEarnService: GraniteV1EarnService,
    private readonly graniteBorrowService: GraniteV1BorrowService,
    private readonly stackingDaoStStxService: StackingDaoStStxService,
    private readonly stackingDaoStStxBtcService: StackingDaoStStxBtcService,
    private readonly zestBorrowService: ZestBorrowService
  ) {}

  private getYieldProductServices(): YieldProductService[] {
    return [
      this.bitflowAmmLpService,
      this.graniteEarnService,
      this.graniteBorrowService,
      this.stackingDaoStStxService,
      this.stackingDaoStStxBtcService,
      this.zestBorrowService,
    ];
  }

  async getAllProviders(signal?: AbortSignal): Promise<StacksProtocol[]> {
    return await Promise.all(
      this.getYieldProductServices().map(service => service.getProvider(signal))
    );
  }

  async getAllProducts(signal?: AbortSignal): Promise<YieldProduct[]> {
    return await Promise.all(
      this.getYieldProductServices().map(service => service.getProduct(signal))
    );
  }

  async getProductsByProvider(
    provider: StacksProtocol,
    signal?: AbortSignal
  ): Promise<YieldProduct[]> {
    return await Promise.all(
      this.getYieldProductServices()
        .filter(service => service.providerKey === provider.id)
        .map(service => service.getProduct(signal))
    );
  }

  async getProductsByCategory(
    category: YieldProductCategory,
    signal?: AbortSignal
  ): Promise<YieldProduct[]> {
    return await Promise.all(
      this.getYieldProductServices()
        .filter(service => service.productCategory === category)
        .map(service => service.getProduct(signal))
    );
  }

  async getAllPositions(account: AccountAddresses, signal?: AbortSignal): Promise<YieldPosition[]> {
    const positionArrays = await Promise.allSettled(
      this.getYieldProductServices().map(service => service.getAccountPositions(account, signal))
    );
    return positionArrays
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
  }

  async getPositionsByProvider(
    account: AccountAddresses,
    provider: StacksProtocol,
    signal?: AbortSignal
  ): Promise<YieldPosition[]> {
    const positionArrays = await Promise.allSettled(
      this.getYieldProductServices()
        .filter(service => service.providerKey === provider.id)
        .map(service => service.getAccountPositions(account, signal))
    );
    return positionArrays
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
  }

  async getPositionsByProduct(
    account: AccountAddresses,
    product: YieldProduct,
    signal?: AbortSignal
  ): Promise<YieldPosition[]> {
    const positionArrays = await Promise.allSettled(
      this.getYieldProductServices()
        .filter(service => service.productKey === product.key)
        .map(service => service.getAccountPositions(account, signal))
    );
    return positionArrays
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
  }

  async getPositionsByCategory(
    account: AccountAddresses,
    category: YieldProductCategory,
    signal?: AbortSignal
  ): Promise<YieldPosition[]> {
    const positionArrays = await Promise.allSettled(
      this.getYieldProductServices()
        .filter(service => service.productCategory === category)
        .map(service => service.getAccountPositions(account, signal))
    );
    return positionArrays
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
  }
}
