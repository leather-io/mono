import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import type {
  AccountAddresses,
  YieldPosition,
  YieldProduct,
  YieldProductCategory,
  YieldProvider,
} from '@leather.io/models';

import type { BitflowAmmLpService } from './providers/bitflow/bitflow-amm-lp.service';
import type { GraniteV1Service } from './providers/granite/granite-v1.service';
import type { StackingDaoLstService } from './providers/stacking-dao/stacking-dao-lst.service';
import type { ZestBorrowService } from './providers/zest/zest-borrow.service';
import type { YieldProductService } from './yield-product.interface';

@injectable()
export class YieldService {
  constructor(
    private readonly bitflowAmmLpService: BitflowAmmLpService,
    private readonly graniteV1Service: GraniteV1Service,
    private readonly stackingDaoLstService: StackingDaoLstService,
    private readonly zestBorrowService: ZestBorrowService
  ) {}

  private getYieldProductServices(): YieldProductService[] {
    return [
      this.bitflowAmmLpService,
      this.graniteV1Service,
      this.stackingDaoLstService,
      this.zestBorrowService,
    ];
  }

  async getAllProviders(): Promise<YieldProvider[]> {
    return await Promise.all(this.getYieldProductServices().map(service => service.getProvider()));
  }

  async getAllProducts(): Promise<YieldProduct[]> {
    return await Promise.all(this.getYieldProductServices().map(service => service.getProduct()));
  }

  async getProductsByProvider(provider: YieldProvider): Promise<YieldProduct[]> {
    return await Promise.all(
      this.getYieldProductServices()
        .filter(service => service.providerKey === provider.key)
        .map(service => service.getProduct())
    );
  }

  async getProductsByCategory(category: YieldProductCategory): Promise<YieldProduct[]> {
    return await Promise.all(
      this.getYieldProductServices()
        .filter(service => service.productCategory === category)
        .map(service => service.getProduct())
    );
  }

  async getAllPositions(account: AccountAddresses): Promise<YieldPosition[]> {
    return (
      await Promise.all(
        this.getYieldProductServices().map(service => service.getAccountPosition(account))
      )
    ).filter(isNonNullish);
  }

  async getPositionsByProvider(
    account: AccountAddresses,
    provider: YieldProvider
  ): Promise<YieldPosition[]> {
    return (
      await Promise.all(
        this.getYieldProductServices()
          .filter(service => service.providerKey === provider.key)
          .map(service => service.getAccountPosition(account))
      )
    ).filter(isNonNullish);
  }

  async getPositionsByProduct(
    account: AccountAddresses,
    product: YieldProduct
  ): Promise<YieldPosition[]> {
    return (
      await Promise.all(
        this.getYieldProductServices()
          .filter(service => service.productKey === product.key)
          .map(service => service.getAccountPosition(account))
      )
    ).filter(isNonNullish);
  }

  async getPositionsByCategory(
    account: AccountAddresses,
    category: YieldProductCategory
  ): Promise<YieldPosition[]> {
    return (
      await Promise.all(
        this.getYieldProductServices()
          .filter(service => service.productCategory === category)
          .map(service => service.getAccountPosition(account))
      )
    ).filter(isNonNullish);
  }
}
