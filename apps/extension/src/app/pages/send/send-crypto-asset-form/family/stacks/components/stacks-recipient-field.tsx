import { getBnsService } from '@leather.io/services';

import { RecipientField } from '../../../components/recipient-fields/recipient-field';

async function fetchStacksNameOwner(bnsName: string) {
  const name = await getBnsService().getBnsName(bnsName);
  return name?.owner ?? null;
}

export function StacksRecipientField() {
  return <RecipientField bnsLookupFn={fetchStacksNameOwner} />;
}
