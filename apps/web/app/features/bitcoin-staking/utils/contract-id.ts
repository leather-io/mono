interface ContractIdParts {
  contractAddress: string;
  contractName: string;
}

export function parseContractId(contractId: string): ContractIdParts {
  const [contractAddress, contractName] = contractId.split('.');
  if (!contractAddress || !contractName) {
    throw new Error(`Invalid contract id: ${contractId}`);
  }
  return { contractAddress, contractName };
}
