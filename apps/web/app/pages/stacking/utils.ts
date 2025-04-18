import { SignedInProps } from './types';

export function hasExistingCommitment(props: SignedInProps) {
  return (
    props.hasExistingDelegation ||
    props.hasExistingDelegatedStacking ||
    props.hasExistingDirectStacking
  );
}
