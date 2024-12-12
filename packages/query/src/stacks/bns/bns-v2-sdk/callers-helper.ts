import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { ClarityValue, callReadOnlyFunction } from '@stacks/transactions';

import { BnsContractName, NetworkType, getBnsContractAddress } from './config';
import { debug } from './debug';
import { BnsReadOnlyOptions } from './interfaces';
import { getFallbackUrl, getNetwork } from './network';

async function executeReadOnlyCall(
  options: BnsReadOnlyOptions,
  contractAddress: string,
  contractName: string,
  network: StacksMainnet | StacksTestnet,
  isZonefile = false
): Promise<ClarityValue> {
  const networkType = network instanceof StacksMainnet ? 'mainnet' : 'testnet';
  const fallbackUrl = getFallbackUrl(networkType);

  debug.log('executeReadOnlyCall initiated:', {
    networkType,
    contractAddress,
    contractName,
    functionName: options.functionName,
    coreApiUrl: network.coreApiUrl,
    fallbackUrl,
    isZonefile,
  });

  async function attemptCall(url: string): Promise<ClarityValue> {
    const currentNetwork =
      networkType === 'mainnet' ? new StacksMainnet({ url }) : new StacksTestnet({ url });

    debug.log('Attempting call with:', {
      url,
      networkType: networkType,
      currentNetworkType: currentNetwork instanceof StacksMainnet ? 'mainnet' : 'testnet',
    });

    try {
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: options.functionName,
        functionArgs: options.functionArgs,
        senderAddress: options.senderAddress,
        network: currentNetwork,
      });

      if ((response as any).error) {
        debug.error('Response contains error:', (response as any).error);
        throw new Error((response as any).error);
      }

      debug.log('Call successful');
      return response;
    } catch (error: any) {
      debug.error('Call failed:', {
        error: error.message,
        url,
        networkType,
      });
      throw error;
    }
  }

  // For zonefile calls, always use fallback URL if available
  if (isZonefile && fallbackUrl) {
    debug.log('Using fallback URL for zonefile call:', fallbackUrl);
    try {
      return await attemptCall(fallbackUrl);
    } catch (error) {
      debug.error('Fallback attempt failed for zonefile:', error);
      throw error;
    }
  }

  // For non-zonefile calls or if no fallback URL, try primary first then fallback
  try {
    return await attemptCall(network.coreApiUrl);
  } catch (error) {
    debug.log('Primary URL failed, checking fallback availability:', {
      hasFallback: !!fallbackUrl,
      fallbackUrl,
      isSameAsPrimary: fallbackUrl === network.coreApiUrl,
    });

    if (fallbackUrl && fallbackUrl !== network.coreApiUrl) {
      try {
        return await attemptCall(fallbackUrl);
      } catch (fallbackError) {
        debug.error('Fallback attempt failed:', fallbackError);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
}

export async function bnsV2ReadOnlyCall(
  options: Omit<BnsReadOnlyOptions, 'network'> & { network: NetworkType }
): Promise<ClarityValue> {
  debug.log('bnsV2ReadOnlyCall initiated:', {
    network: options.network,
    functionName: options.functionName,
  });

  const network = getNetwork(options.network);
  const contractAddress = getBnsContractAddress(options.network);

  debug.log('Network configuration:', {
    networkType: options.network,
    contractAddress,
    isMainnet: network instanceof StacksMainnet,
    apiUrl: network.coreApiUrl,
  });

  return executeReadOnlyCall(options, contractAddress, BnsContractName, network, false);
}
