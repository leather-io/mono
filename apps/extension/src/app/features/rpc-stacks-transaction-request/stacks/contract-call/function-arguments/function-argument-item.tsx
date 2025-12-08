import { HStack, Stack, styled } from 'leather-styles/jsx';

import { getStacksExplorerLink } from '@leather.io/features';
import { ChainId } from '@leather.io/models';
import { Link } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

interface FunctionArgumentItemProps {
  name?: React.ReactNode | null;
  type?: string;
  value: string;
}
export function FunctionArgumentItem({ name, type, value }: FunctionArgumentItemProps) {
  const { chain, isNakamotoTestnet } = useCurrentNetworkState();
  const networkMode = chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet';
  return (
    <Stack gap="space.03">
      <HStack alignItems="center" flexShrink={0} justifyContent="space-between">
        {name && (
          <styled.span color="ink.text-subdued" textStyle="caption.01">
            {name}
          </styled.span>
        )}
        {type && (
          <styled.span color="ink.text-subdued" textStyle="caption.01">
            {type}
          </styled.span>
        )}
      </HStack>
      {type?.toLowerCase() === 'principal' ? (
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
      ) : (
        <styled.span display="block" textStyle="body.02" wordBreak="break-all">
          {value}
        </styled.span>
      )}
    </Stack>
  );
}
