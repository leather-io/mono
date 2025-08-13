import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useGetContractInterface } from '@/queries/stacks/contract-interface.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { deserializeTransaction } from '@stacks/transactions';

import { getSip10TransferRecipient } from '@leather.io/stacks';

import { assertContractCallPayload, getContractAddress } from '../utils';
import { OutcomeAddressesCard } from './outcome-addresses-card';

export function Sip10Recipient({ txHex, accountId }: { txHex: string; accountId: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  const contractAddress = getContractAddress(tx.payload);
  const { functionArgs, functionName, contractName } = tx.payload;

  const { data: contractInterfaceData } = useGetContractInterface(
    contractAddress,
    contractName.content
  );
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const sip10Data = useSip10AccountBalance(fingerprint, accountIndex);

  if (!contractInterfaceData) return null;

  const recipient = getSip10TransferRecipient({
    functionName: functionName.content,
    functionArgs,
    contractInterfaceData,
  });

  if (!recipient) return null;

  const token = sip10Data.value?.sip10s.find(
    sip10 => sip10.asset.contractId === `${contractAddress}.${contractName.content}`
  );

  if (!token) return null;

  return <OutcomeAddressesCard addresses={[recipient]} />;
}
