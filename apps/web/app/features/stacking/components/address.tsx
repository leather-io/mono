import { Box, Flex, styled } from 'leather-styles/jsx';

import { CopyIcon, ExternalLinkIcon, useClipboard } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

interface AddressProps {
  address: string;
}

export function Address({ address }: AddressProps) {
  return (
    <styled.p mr="space.02" textStyle="label.02">
      {truncateMiddle(address)}
    </styled.p>
  );
}

export function CopyAddress({ address }: AddressProps) {
  const { onCopy } = useClipboard(address);

  return (
    <Flex alignItems="center">
      <Box onClick={onCopy} display="inline-block" cursor="pointer">
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
      <Flex alignItems="center">
        <Box display="inline-block">
          <ExternalLinkIcon variant="small" />
        </Box>
        <Address address={address} />
      </Flex>
    </styled.a>
  );
}
