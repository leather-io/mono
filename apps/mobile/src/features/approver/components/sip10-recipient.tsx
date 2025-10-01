import { useGetContractInterface } from '@/queries/stacks/contract-interface.query';
import { t } from '@lingui/core/macro';
import { deserializeTransaction } from '@stacks/transactions';

import { getSip9TransferRecipient, getSip10TransferRecipient } from '@leather.io/stacks';
import { Approver } from '@leather.io/ui/native';

import { assertContractCallPayload, getContractAddress } from '../utils';
import { OutcomeAddressesCard } from './outcome-addresses-card';

export function SipRecipient({ txHex }: { txHex: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  const contractAddress = getContractAddress(tx.payload);
  const { functionArgs, functionName, contractName } = tx.payload;

  const { data: contractInterfaceData } = useGetContractInterface(
    contractAddress,
    contractName.content
  );

  if (!contractInterfaceData) return null;

  const sip9recipient = getSip9TransferRecipient({
    functionName: functionName.content,
    functionArgs,
    contractInterfaceData,
  });
  const sip10recipient = getSip10TransferRecipient({
    functionName: functionName.content,
    functionArgs,
    contractInterfaceData,
  });
  const recipient = sip9recipient ?? sip10recipient;

  const outcome = recipient ? <OutcomeAddressesCard addresses={[recipient]} /> : null;

  if (!outcome) return null;

  return (
    <Approver.Section>
      <Approver.Subheader>{t`To address`}</Approver.Subheader>
      {outcome}
    </Approver.Section>
  );
}
