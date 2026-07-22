interface PoxContractVersion {
  contract_id: string;
  activation_burnchain_block_height: number;
}

export type Pox5Status =
  | { status: 'not-configured' }
  | { status: 'pre-activation'; activationBurnHeight: number }
  | { status: 'active'; activationBurnHeight: number };

interface GetPox5StatusArgs {
  contractVersions: PoxContractVersion[] | undefined;
  configuredActivationHeight: number | null;
  currentBurnHeight: number | undefined;
}

// The node announces pox contract activations through /v2/pox
// contract_versions (the mechanism used for pox-2/3/4), so once pox-5 appears
// there the status flips with no code change. The configured height is a
// per-network override for devnet and manual testing.
export function getPox5Status(args: GetPox5StatusArgs): Pox5Status {
  const { contractVersions, configuredActivationHeight, currentBurnHeight } = args;

  const announcedVersion = contractVersions?.find(version =>
    version.contract_id.endsWith('.pox-5')
  );
  const activationBurnHeight =
    announcedVersion?.activation_burnchain_block_height ?? configuredActivationHeight;

  if (activationBurnHeight === null || activationBurnHeight === undefined) {
    return { status: 'not-configured' };
  }
  if (currentBurnHeight !== undefined && currentBurnHeight >= activationBurnHeight) {
    return { status: 'active', activationBurnHeight };
  }
  return { status: 'pre-activation', activationBurnHeight };
}
