import { Box, Flex, styled } from 'leather-styles/jsx';

import { CopyIcon, ExternalLinkIcon, useClipboard } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

interface AddressProps {
  address: string;
}

export function Address({ address }: AddressProps) {
  return (
    <styled.p
      mr="space.02"
      textStyle="label.03"
      textDecoration="underline"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {truncateMiddle(address)}
    </styled.p>
  );
}

export function CopyAddress({ address }: AddressProps) {
  const { onCopy } = useClipboard(address);

  return (
    <Flex
      alignItems="center"
      gap="space.01"
      onClick={onCopy}
      cursor="pointer"
      maxWidth={['250px', 'none', '220px', 'none']}
    >
      <Box display="inline-block">
        <CopyIcon variant="small" />
      </Box>
      <Address address={address} />
    </Flex>
  );
}

interface ExternalAddressProps {
  address: string;
  href: string;
}

export function ExternalAddress({ address, href }: ExternalAddressProps) {
  return (
    <styled.a href={href} target="_blank">
      <Flex alignItems="center" gap="space.01" maxWidth={['250px', 'none', '220px', 'none']}>
        <Box display="inline-block">
          <ExternalLinkIcon variant="small" />
        </Box>
        <Address address={address} />
      </Flex>
    </styled.a>
  );
}
