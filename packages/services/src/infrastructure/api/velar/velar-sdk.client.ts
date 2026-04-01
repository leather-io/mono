import { VelarSDK, getTokensMeta } from '@velarprotocol/velar-sdk';
import { AmountOutResponse, SwapResponse, Token } from '@velarprotocol/velar-sdk/dist/types/Swap';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';

export type VelarSdkToken = Token;
type VelarSdkAmountOutResponse = AmountOutResponse;
type VelarSdkSwapResponse = SwapResponse;

@injectable()
export class VelarSdkClient {
  private readonly velarSdk: VelarSDK;

  constructor(@inject(Types.CacheService) private readonly cacheService: HttpCacheService) {
    this.velarSdk = new VelarSDK();
  }

  public async getTokens(): Promise<VelarSdkToken[]> {
    return await this.cacheService.fetchWithCache(['velar-sdk-get-tokens'], () => getTokensMeta());
  }

  public async getTokenPairs(baseSymbol: string): Promise<string[]> {
    return await this.cacheService.fetchWithCache(['velar-sdk-get-token-pairs', baseSymbol], () =>
      this.velarSdk.getPairs(baseSymbol)
    );
  }

  public async getComputedAmount(
    inToken: string,
    outToken: string,
    amount: number
  ): Promise<VelarSdkAmountOutResponse> {
    const swapInstance = await this.velarSdk.getSwapInstance({
      account: '',
      inToken,
      outToken,
    });
    return await swapInstance.getComputedAmount({ amount });
  }

  public async getSwap(
    account: string,
    inToken: string,
    outToken: string,
    amount: number,
    slippage: number
  ): Promise<VelarSdkSwapResponse> {
    const swapInstance = await this.velarSdk.getSwapInstance({
      account,
      inToken,
      outToken,
    });
    return await swapInstance.swap({ amount, slippage });
  }
}
