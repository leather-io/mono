import { styled } from 'leather-styles/jsx';

import { PlusIcon } from '@leather.io/ui';

interface CreateVaultTileProps {
  onClick(): void;
}

export function CreateVaultTile({ onClick }: CreateVaultTileProps) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="space.02"
      width="100%"
      cursor="pointer"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="ink.border-default"
      bg="transparent"
      color="ink.text-subdued"
      textStyle="label.02"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
    >
      <PlusIcon variant="small" />
      Create new vault
    </styled.button>
  );
}
