import { t } from '@lingui/core/macro';
import {
  FungibleConditionCode,
  NonFungibleConditionCode,
  type PostConditionWire,
  addressToString,
} from '@stacks/transactions';

import { match, truncateMiddle } from '@leather.io/utils';

const conditionCodeMatcher = match<FungibleConditionCode | NonFungibleConditionCode>();

function getUserPcTitle(conditionCode: FungibleConditionCode | NonFungibleConditionCode) {
  return conditionCodeMatcher(conditionCode, {
    [FungibleConditionCode.Equal]: t`You will transfer exactly`,
    [FungibleConditionCode.Greater]: t`You will transfer more than`,
    [FungibleConditionCode.GreaterEqual]: t`You will transfer equal to or greater than`,
    [FungibleConditionCode.Less]: t`You will transfer less than`,
    [FungibleConditionCode.LessEqual]: t`You will transfer less than or equal to`,
    [NonFungibleConditionCode.Sends]: t`You will transfer`,
    [NonFungibleConditionCode.DoesNotSend]: t`You will keep`,
  });
}
function getContractPcTitle(conditionCode: FungibleConditionCode | NonFungibleConditionCode) {
  return conditionCodeMatcher(conditionCode, {
    [FungibleConditionCode.Equal]: t`The contract will transfer exactly`,
    [FungibleConditionCode.Greater]: t`The contract will transfer more than`,
    [FungibleConditionCode.GreaterEqual]: t`The contract will transfer equal to or greater than`,
    [FungibleConditionCode.Less]: t`The contract will transfer less than`,
    [FungibleConditionCode.LessEqual]: t`The contract will transfer less than or equal to`,
    [NonFungibleConditionCode.Sends]: t`The contract will transfer`,
    [NonFungibleConditionCode.DoesNotSend]: t`The contract will keep`,
  });
}

function getAddressPcTitle(
  conditionCode: FungibleConditionCode | NonFungibleConditionCode,
  address: string
) {
  const shortenedPcAddress = truncateMiddle(address, 4);
  return conditionCodeMatcher(conditionCode, {
    [FungibleConditionCode.Equal]: t`Another address ${shortenedPcAddress} will transfer exactly`,
    [FungibleConditionCode.Greater]: t`Another address ${shortenedPcAddress} will transfer more than`,
    [FungibleConditionCode.GreaterEqual]: t`Another address ${shortenedPcAddress} will transfer equal to or greater than`,
    [FungibleConditionCode.Less]: t`Another address ${shortenedPcAddress} will transfer less than`,
    [FungibleConditionCode.LessEqual]: t`Another address ${shortenedPcAddress} will transfer less than or equal to`,
    [NonFungibleConditionCode.Sends]: t`Another address ${shortenedPcAddress} will transfer`,
    [NonFungibleConditionCode.DoesNotSend]: t`Another address ${shortenedPcAddress} will keep`,
  });
}

interface FormatPostConditionMessageArgs {
  stacksAddress: string;
  isContractPrincipal: boolean;
  postCondition: PostConditionWire;
}

export function formatPostConditionMessage({
  stacksAddress,
  isContractPrincipal,
  postCondition: pc,
}: FormatPostConditionMessageArgs) {
  const address = 'address' in pc.principal ? addressToString(pc.principal.address) : null;
  const userIsSending = address === stacksAddress;
  function getTitle() {
    if (isContractPrincipal) {
      return getContractPcTitle(pc.conditionCode);
    }
    if (userIsSending) {
      return getUserPcTitle(pc.conditionCode);
    }
    if (address) {
      return getAddressPcTitle(pc.conditionCode, address);
    }
    return null;
  }

  return getTitle();
}
