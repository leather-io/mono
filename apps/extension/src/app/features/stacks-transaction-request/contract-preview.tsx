import { HStack, Stack } from 'leather-styles/jsx';

import { formatContractId } from '@leather.io/stacks';
import { Avatar, Caption, Title, getAvatarUrl } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

interface ContractPreviewLayoutProps {
  contractAddress: string;
  contractName: string;
  functionName?: string;
  onClick?(): void;
}

export function ContractPreviewLayout({
  contractAddress,
  contractName,
  functionName,
  onClick,
}: ContractPreviewLayoutProps) {
  const avatarSeed = `${formatContractId(contractAddress, contractName)}${
    functionName ? `::${functionName}` : ''
  }`;

  return (
    <HStack
      p="space.04"
      borderRadius="sm"
      gap="space.04"
      alignItems="center"
      border="default"
      onClick={onClick}
      _hover={
        onClick
          ? {
              cursor: 'pointer',
            }
          : undefined
      }
    >
      <Avatar image={getAvatarUrl(avatarSeed)} size="xl" />
      <Stack gap="space.03">
        <Title>{functionName || contractName}</Title>
        <Caption>
          {truncateMiddle(contractAddress, functionName ? 4 : 6)}
          {functionName ? `.${contractName}` : ''}
        </Caption>
      </Stack>
    </HStack>
  );
}
