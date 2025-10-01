import { useSip10FtMetadata } from '@/queries/assets/sip10-asset.query';
import {
  FungiblePostConditionWire,
  PostConditionPrincipalId,
  addressToString,
} from '@stacks/transactions';

import { Approver, Box, CircledFunctionIcon } from '@leather.io/ui/native';

import { AssetOutcomeBalance } from '../asset-outcome';
import { formatPostConditionMessage } from './post-conditions.utils';

interface FTPostConditionProps {
  stacksAddress: string;
  postCondition: FungiblePostConditionWire;
}

export function FTPostCondition({ stacksAddress, postCondition }: FTPostConditionProps) {
  const contractAddress = addressToString(postCondition.asset.address);
  const contractName = postCondition.asset.contractName.content;
  const contractId = `${contractAddress}.${contractName}`;
  const asset = useSip10FtMetadata(contractId);

  const isContractPrincipal = postCondition.principal.prefix === PostConditionPrincipalId.Contract;

  const title = formatPostConditionMessage({
    stacksAddress,
    isContractPrincipal,
    postCondition,
  });
  if (!asset.data) return null;

  return (
    <Box>
      <Approver.Subheader icon={<CircledFunctionIcon variant="small" />}>
        {title}
      </Approver.Subheader>
      <AssetOutcomeBalance asset={asset.data} amount={Number(postCondition.amount)} />
    </Box>
  );
}
