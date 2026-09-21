import type { ReactNode } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { ListItemBox } from '@leather.io/ui';

import { CopyValue } from '@app/components/value-actions';

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
        caption={<CopyValue value={address} />}
      />
    </Stack>
  );
}
