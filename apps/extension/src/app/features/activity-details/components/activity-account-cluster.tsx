import type { ReactNode } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { ListItemBox } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';

interface ActivityAccountAddressProps {
  address: string;
}

function ActivityAccountAddress({ address }: ActivityAccountAddressProps) {
  const { onCopy } = useClipboard(address);
  return (
    <styled.button
      type="button"
      onClick={onCopy}
      title="Copy address"
      textStyle="caption.01"
      color="ink.text-subdued"
      textDecoration="underline"
      cursor="pointer"
      textAlign="left"
      width="fit-content"
      _hover={{ color: 'ink.text-primary' }}
    >
      {truncateMiddle(address, 6)}
    </styled.button>
  );
}

interface ActivityAccountClusterProps {
  avatar: ReactNode;
  name: string;
  address: string;
}

export function ActivityAccountCluster({ avatar, name, address }: ActivityAccountClusterProps) {
  return (
    <Stack gap="space.03" bg="ink.background-primary" px="space.05" py="space.04">
      <styled.span textStyle="label.02">With account</styled.span>
      <ListItemBox
        variant="plain"
        leading={avatar}
        title={<styled.span textStyle="label.01">{name}</styled.span>}
        caption={<ActivityAccountAddress address={address} />}
      />
    </Stack>
  );
}
