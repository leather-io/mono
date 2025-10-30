import { useSettings } from '@/store/settings/settings';
import { ChainId } from '@stacks/network';

type HiroExplorerUrlType = 'block' | 'contract' | 'address';
interface UseGetHiroExplorerUrlProps {
  type: HiroExplorerUrlType;
  value: number | string;
}
// FIXME: similar code in makeActivityExplorerLink - deprecate in extension
export function useGetHiroExplorerUrl({ type, value }: UseGetHiroExplorerUrlProps) {
  const hiroExplorerUrl = `https://explorer.hiro.so/`;
  const { networkPreference } = useSettings();
  const chainName =
    networkPreference.chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet';
  return `${hiroExplorerUrl}/${type}/${value}?chain=${chainName}`;
}
