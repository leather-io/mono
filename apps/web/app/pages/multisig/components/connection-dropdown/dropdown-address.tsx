import { useState } from 'react';

import { styled } from 'leather-styles/jsx';
import { useClipboardCopy } from '~/utils/use-clipboard-copy';

import { CheckmarkIcon, CopyIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

export function DropdownAddress({ address }: { address: string }) {
  const { copied, copy } = useClipboardCopy();
  const [hovered, setHovered] = useState(false);
  return (
    <styled.button
      type="button"
      onClick={() => copy(address)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Copy address"
      display="flex"
      alignItems="center"
      gap="space.01"
      width="fit-content"
      height="20px"
      cursor="pointer"
      ml="-space.01"
      px="space.01"
      borderRadius="sm"
      bg="transparent"
      color="ink.text-subdued"
      textStyle="code"
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <styled.span>{truncateMiddle(address, 10)}</styled.span>
      {copied ? (
        <CheckmarkIcon
          variant="small"
          width={12}
          height={12}
          color="green.action-primary-default"
        />
      ) : (
        <CopyIcon
          variant="small"
          width={12}
          height={12}
          color={hovered ? 'ink.text-primary' : 'ink.text-subdued'}
        />
      )}
    </styled.button>
  );
}
