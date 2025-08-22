/* eslint-disable @typescript-eslint/require-await */
import { injectable } from 'inversify';

import {
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwapQuote,
} from '@leather.io/models';

import { AlexSdkClient } from '../infrastructure/api/alex/alex-sdk.client';
import { SwapProviderService } from './swap-provider.interface';

@injectable()
export class AlexSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'alex-sdk';

  constructor(private readonly alexSdkClient: AlexSdkClient) {}

  async getBaseSwapAssets(): Promise<SwapProviderAsset[]> {
    return [];
  }

  async getTargetAssets(): Promise<SwapProviderAsset[]> {
    return [];
  }

  async getSwapQuotes(): Promise<SwapQuote[]> {
    return [];
  }

  async getSwapExecutionData(): Promise<SwapExecutionData> {
    throw new Error('Method not implemented.');
  }
}
