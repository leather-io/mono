import { HIRO_INSCRIPTIONS_API_URL } from '@leather-wallet/constants';
import axios from 'axios';

import { InscriptionResponseItem } from '../../../types/inscription';

export async function fetchInscripionById(id: string) {
  return axios.get<InscriptionResponseItem>(`${HIRO_INSCRIPTIONS_API_URL}/${id}`);
}
