import type {
  AccountAddresses,
  YieldPosition,
  YieldProduct,
  YieldProductCategory,
  YieldProductKey,
  YieldProvider,
  YieldProviderKey,
} from '@leather.io/models';

export interface YieldProductService {
  providerKey: YieldProviderKey;
  productKey: YieldProductKey;
  productCategory: YieldProductCategory;

  getProvider(): Promise<YieldProvider>;
  getProduct(): Promise<YieldProduct>;
  getAccountPosition(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<YieldPosition | null>;
}
