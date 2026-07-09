import axios from 'axios';

import { ApiRequestOptions } from '../types';
import {
  type ChainalysisRiskAssessment,
  chainalysisRiskAssessmentSchema,
} from './chainalysis-api.schema';

const chainalysisEntitiesApiUrl = 'https://api.chainalysis.com/api/risk/v2/entities';

const chainalysisApiHeaders = {
  // Known public key, do not open a vulnerability report for this
  Token: '6a5ed92c4fff04d0d11db4668db3ff716ff95f83e302fccf649aed597c869f7c',
};

export class ChainalysisApiClient {
  public async fetchAddressRiskAssessment(
    address: string,
    { signal }: ApiRequestOptions = {}
  ): Promise<ChainalysisRiskAssessment> {
    await axios.post(
      chainalysisEntitiesApiUrl,
      { address },
      { headers: chainalysisApiHeaders, signal }
    );
    const { data } = await axios.get(`${chainalysisEntitiesApiUrl}/${address}`, {
      headers: chainalysisApiHeaders,
      signal,
    });
    return chainalysisRiskAssessmentSchema.parse(data);
  }
}
