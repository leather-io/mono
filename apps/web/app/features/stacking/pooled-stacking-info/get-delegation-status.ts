import { StacksNetwork } from '@stacks/network';
import {
  DelegationInfo,
  StackingClient,
  extractPoxAddressFromClarityValue,
} from '@stacks/stacking';
import {
  ContractCallTransaction,
  ContractCallTransactionMetadata,
  MempoolContractCallTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { ClarityType, ClarityValue, cvToString, hexToCV } from '@stacks/transactions';

import { StacksClient } from '@leather.io/query';

import { getHasPendingTransaction } from '../direct-stacking-info/utils-pending-txs';
import { getPoxContractsByNetwork } from '../start-pooled-stacking/utils/utils-preset-pools';

function isDelegateOrRevokeDelegate(t: ContractCallTransactionMetadata) {
  return ['delegate-stx', 'revoke-delegate-stx'].includes(t.contract_call.function_name);
}

function safeDelegateToCVToString(clarityValue: ClarityValue | undefined) {
  if (
    !clarityValue ||
    (clarityValue.type !== ClarityType.PrincipalStandard &&
      clarityValue.type !== ClarityType.PrincipalContract)
  ) {
    throw new Error('Expected `delegate-to` to be defined.');
  }
  return cvToString(clarityValue);
}

function getDelegationStatusFromTransaction(network: StacksNetwork) {
  return (
    transaction: ContractCallTransaction | MempoolContractCallTransaction
  ): DelegationInfo => {
    const poxContracts = getPoxContractsByNetwork(network);

    if (transaction.contract_call.function_name === 'revoke-delegate-stx') {
      return { delegated: false } as const;
    }

    if (transaction.contract_call.function_name === 'delegate-stx') {
      const args = transaction.contract_call.function_args;
      if (!Array.isArray(args)) {
        // eslint-disable-next-line no-console
        console.error('Detected a non-standard delegate-stx transaction.');
        return { delegated: false } as const;
      }

      const [amountMicroStxCV, delegatedToCV, untilBurnHeightCV, poxAddressCV] = args.map<
        // The values above should be partially defined as long as the clarity contract
        // and the api follows the PoX pattern. They can be undefined.
        ClarityValue | undefined
      >(arg => hexToCV(arg.hex));

      if (!amountMicroStxCV || amountMicroStxCV.type !== ClarityType.UInt) {
        throw new Error('Expected `amount-ustx` to be defined.');
      }
      const amountMicroStx = BigInt(amountMicroStxCV.value);

      let untilBurnHeight: undefined | number = undefined;

      if (
        transaction.contract_call.contract_id === poxContracts['WrapperFastPool'] ||
        transaction.contract_call.contract_id === poxContracts['WrapperRestake']
      ) {
        untilBurnHeight = undefined;
      } else {
        if (
          untilBurnHeightCV &&
          untilBurnHeightCV.type === ClarityType.OptionalSome &&
          untilBurnHeightCV.value.type === ClarityType.UInt
        ) {
          untilBurnHeight = Number(untilBurnHeightCV.value.value);
        }
      }

      const delegatedTo =
        transaction.contract_call.contract_id === poxContracts['WrapperFastPool']
          ? poxContracts['WrapperFastPool']
          : transaction.contract_call.contract_id === poxContracts['WrapperRestake']
            ? poxContracts['WrapperRestake']
            : safeDelegateToCVToString(delegatedToCV);

      function extractPoxAddressFromClarityValue2(poxAddrCV: ClarityValue) {
        const { version, hashBytes } = extractPoxAddressFromClarityValue(poxAddrCV);
        return { version, hashbytes: hashBytes };
      }

      const poxAddress =
        poxAddressCV !== undefined ? extractPoxAddressFromClarityValue2(poxAddressCV) : undefined;

      return {
        delegated: true,
        details: {
          amount_micro_stx: amountMicroStx,
          delegated_to: delegatedTo,
          until_burn_ht: untilBurnHeight,
          pox_address: poxAddress,
        },
      } as const;
    }

    // TODO: log error
    // eslint-disable-next-line no-console
    console.error(
      'Processed a non-delegation transaction. Only delegation-related transaction should be used with this function.'
    );
    return { delegated: false } as const;
  };
}

interface Args {
  stackingClient: StackingClient;
  stacksClient: StacksClient;
  address: string;
  network: StacksNetwork;
}
export async function getDelegationStatus({
  stackingClient,
  stacksClient,
  address,
  network,
}: Args): Promise<DelegationInfo> {
  const delegationStatus = await getHasPendingTransaction({
    stackingClient,
    stacksClient,
    address,
    transactionConverter: getDelegationStatusFromTransaction(network),
    transactionPredicate: isDelegateOrRevokeDelegate,
  });
  if (delegationStatus !== null) {
    return delegationStatus;
  }
  return stackingClient.getDelegationStatus();
}
