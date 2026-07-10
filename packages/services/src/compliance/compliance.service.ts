import { AxiosError } from 'axios';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';

import { ChainalysisApiClient } from '../infrastructure/api/chainalysis/chainalysis-api.client';
import type { ChainalysisRiskLevel } from '../infrastructure/api/chainalysis/chainalysis-api.schema';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';

const nonCompliantRiskLevels: ChainalysisRiskLevel[] = ['High', 'Severe'];

export type AddressComplianceCheckResult =
  | { status: 'compliant' }
  | { status: 'non_compliant'; risk: ChainalysisRiskLevel }
  | { status: 'unavailable'; reason: string };

@injectable()
export class ComplianceService {
  constructor(
    private readonly chainalysisApiClient: ChainalysisApiClient,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}

  public async checkAddressCompliance(
    address: string,
    signal?: AbortSignal
  ): Promise<AddressComplianceCheckResult> {
    if (selectBitcoinNetworkMode(this.settings.getSettings()) !== 'mainnet') {
      return { status: 'compliant' };
    }

    try {
      const assessment = await this.chainalysisApiClient.fetchAddressRiskAssessment(address, {
        signal,
      });
      if (nonCompliantRiskLevels.includes(assessment.risk)) {
        return { status: 'non_compliant', risk: assessment.risk };
      }
      return { status: 'compliant' };
    } catch (error) {
      return { status: 'unavailable', reason: this.getUnavailableReason(error) };
    }
  }

  private getUnavailableReason(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.response ? `http_${error.response.status}` : 'network_error';
    }
    if (error instanceof ZodError) return 'unexpected_response_shape';
    return 'unknown_error';
  }
}
