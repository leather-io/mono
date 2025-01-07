// TODO: These utilities are needed in the Stacks queries, but
// they will later be available in @leather.io/stacks. We should
// remove these when possible.

/**
 * Gets the contract name of a fully qualified name of an asset.
 *
 * @param contractId - the source string: [principal].[contract-name] or [principal].[contract-name]::[asset-name]
 */
export function getStacksContractName(contractId: string): string {
  if (contractId.includes('.')) {
    const parts = contractId?.split('.');
    if (contractId.includes('::')) {
      return parts[1].split('::')[0];
    }
    return parts[1];
  }
  // logger.warn(
  //   'getStacksContractName: does not contain a period, does not appear to be a contractId.',
  //   contractId
  // );
  return contractId;
}

/**
 * Gets the asset name from a a fully qualified name of an asset.
 *
 * @param contractId - the fully qualified name of the asset: [principal].[contract-name]::[asset-name]
 */
function getStacksContractAssetName(contractId: string): string {
  if (!contractId.includes('::')) {
    // logger.warn(
    //   'getStacksContractAssetName: does not contain "::", does not appear to be a fully qualified name of an asset.',
    //   contractId
    // );
    return contractId;
  }
  return contractId.split('::')[1];
}

/**
 * Gets the parts that make up a fully qualified name of an asset.
 *
 * @param contractId - the fully qualified name of the asset: [principal].[contract-name]::[asset-name]
 */
export function getStacksContractIdStringParts(contractId: string): {
  contractAddress: string;
  contractAssetName: string;
  contractName: string;
} {
  if (!contractId.includes('.') || !contractId.includes('::')) {
    // logger.warn(
    //   'getStacksContractIdStringParts: does not contain a period or "::", does not appear to be a fully qualified name of an asset.',
    //   contractId
    // );
    return {
      contractAddress: contractId,
      contractAssetName: contractId,
      contractName: contractId,
    };
  }

  const contractAddress = contractId.split('.')[0];
  const contractAssetName = getStacksContractAssetName(contractId);
  const contractName = getStacksContractName(contractId);

  return {
    contractAddress,
    contractAssetName,
    contractName,
  };
}
