import { useState } from 'react';

import { HStack, Stack, styled } from 'leather-styles/jsx';

import { getStacksExplorerLink } from '@leather.io/features';
import { ChainId } from '@leather.io/models';
import { ChevronDownIcon, ChevronUpIcon, Link } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

const longValueThreshold = 512;
const previewLength = 80;

interface ExpandableValueProps {
  value: string;
}

function FunctionArgumentValue({
  value,
  isPrincipal,
  isLongValue,
}: ExpandableValueProps & {
  isPrincipal: boolean;
  isLongValue: boolean;
}) {
  const { chain, isNakamotoTestnet } = useCurrentNetworkState();
  const networkMode = chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet';
  if (isPrincipal) {
    return (
      <Link
        size="sm"
        variant="text"
        wordBreak="break-all"
        onClick={() =>
          openInNewTab(
            getStacksExplorerLink({
              mode: networkMode,
              type: 'address',
              value,
              isNakamoto: isNakamotoTestnet,
            })
          )
        }
      >
        {value}
      </Link>
    );
  }

  if (isLongValue) {
    return <ExpandableValue value={value} />;
  }

  return (
    <styled.span display="block" textStyle="body.02" wordBreak="break-all">
      {value}
    </styled.span>
  );
}

function ExpandableValue({ value }: ExpandableValueProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = value.slice(0, previewLength) + '…';

  return (
    <styled.button
      type="button"
      display="flex"
      alignItems="flex-start"
      gap="space.01"
      cursor="pointer"
      textAlign="left"
      _hover={{ textDecoration: 'underline' }}
      _focus={{ outline: 0, textDecoration: 'underline' }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <styled.span textStyle="body.02" wordBreak="break-all" flex="1">
        {isExpanded ? value : preview}
      </styled.span>
      {isExpanded ? <ChevronUpIcon variant="small" /> : <ChevronDownIcon variant="small" />}
    </styled.button>
  );
}

interface FunctionArgumentItemProps {
  name?: React.ReactNode | null;
  type?: string;
  value: string;
}

export function FunctionArgumentItem({ name, type, value }: FunctionArgumentItemProps) {
  const isLongValue = value.length > longValueThreshold;
  const isPrincipal = type?.toLowerCase() === 'principal';

  return (
    <Stack gap="space.03">
      <HStack alignItems="center" flexShrink={0} justifyContent="space-between">
        {name && (
          <styled.span color="ink.text-subdued-primary" textStyle="caption.01">
            {name}
          </styled.span>
        )}
        {type && (
          <styled.span color="ink.text-subdued-primary" textStyle="caption.01">
            {type}
          </styled.span>
        )}
      </HStack>
      <FunctionArgumentValue value={value} isPrincipal={isPrincipal} isLongValue={isLongValue} />
    </Stack>
  );
}
