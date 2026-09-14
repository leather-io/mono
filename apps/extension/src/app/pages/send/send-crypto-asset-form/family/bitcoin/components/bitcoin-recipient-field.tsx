import { getBnsService } from '@leather.io/services';

import { RecipientField } from '../../../components/recipient-fields/recipient-field';

async function fetchBtcNameOwner(bnsName: string) {
  const profile = await getBnsService().getBnsProfile(bnsName);
  return profile?.profileData.addresses?.bitcoinPayment ?? null;
}

export function TransferRecipientField() {
  return <RecipientField bnsLookupFn={fetchBtcNameOwner} />;
}
