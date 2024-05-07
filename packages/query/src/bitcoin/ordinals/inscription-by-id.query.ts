import { HIRO_INSCRIPTIONS_API_URL } from '@leather-wallet/models';
import axios from 'axios';

import { InscriptionResponse } from '../../../types/inscription';

export async function fetchInscripionById(id: string) {
  return axios.get<InscriptionResponse>(`${HIRO_INSCRIPTIONS_API_URL}/${id}`);
}
