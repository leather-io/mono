import { HIRO_INSCRIPTIONS_API_URL } from '@leather-wallet/models';
import axios from 'axios';

import { InscriptionResponseHiro } from '../../../types/inscription';

/**
 * @deprecated Use useInscription instead
 */
export async function fetchInscripionById(id: string) {
  return axios.get<InscriptionResponseHiro>(`${HIRO_INSCRIPTIONS_API_URL}/${id}`);
}
