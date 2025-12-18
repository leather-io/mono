import { PayloadType, StacksTransactionWire, addressToString } from '@stacks/transactions';
import { Box, BoxProps } from 'leather-styles/jsx';

import { StacksTx } from '@leather.io/models';
import { AssetAvatarIcon, Avatar, getAvatarUrl } from '@leather.io/ui';

import { getTxSenderAddress } from '@app/common/transactions/stacks/transaction.utils';
import { TransactionTypeIcon } from '@app/components/transaction/transaction-type-icon';

interface SubmittedTransactionIconProps extends BoxProps {
  transaction: StacksTransactionWire;
}
export function SubmittedTransactionIcon({ transaction, ...rest }: SubmittedTransactionIconProps) {
  const senderAddress = getTxSenderAddress(transaction);

  switch (transaction.payload.payloadType) {
    case PayloadType.SmartContract:
      return (
        <Box position="relative" {...rest}>
          <Avatar
            image={getAvatarUrl(
              `${getTxSenderAddress(transaction)}.${transaction.payload.contractName.content}`
            )}
            size="xl"
          />
          <TransactionTypeIcon
            transaction={
              {
                sender_address: senderAddress,
                tx_type: 'smart_contract',
                tx_status: 'pending',
              } as StacksTx
            }
          />
        </Box>
      );
    case PayloadType.ContractCall:
      return (
        <Box position="relative" {...rest}>
          <Avatar
            image={getAvatarUrl(
              `${addressToString(transaction.payload.contractAddress)}.${
                transaction.payload.contractName.content
              }::${transaction.payload.functionName.content}`
            )}
            size="xl"
          />
          <TransactionTypeIcon
            transaction={
              {
                sender_address: senderAddress,
                tx_type: 'contract_call',
                tx_status: 'pending',
              } as StacksTx
            }
          />
        </Box>
      );
    case PayloadType.TokenTransfer:
      return (
        <Box position="relative" flexShrink={0} {...rest}>
          <AssetAvatarIcon asset={{ protocol: 'nativeStx' }} size="xl" />
          <TransactionTypeIcon
            transaction={
              {
                sender_address: senderAddress,
                tx_type: 'token_transfer',
                tx_status: 'pending',
              } as StacksTx
            }
          />
        </Box>
      );
    default:
      return null;
  }
}
