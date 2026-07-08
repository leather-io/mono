import type { BnsResolution } from '~/queries/bns/bns.query';

// A label.namespace shape (allowing subdomains like fyq.us20.btc). Stacks/Bitcoin
// addresses never contain a dot, so a dotted member field is always a BNS candidate.
const bnsNamePattern = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$/i;

export function looksLikeBnsName(value: string): boolean {
  return bnsNamePattern.test(value.trim());
}

type MemberBnsStatus = 'none' | 'resolving' | 'not-found' | 'mismatch';

interface ReconciledMember {
  addr: string;
  name: string;
  bns: MemberBnsStatus;
}

// Resolves a member draft's BNS usage into a concrete { addr, name }, enforcing the
// anti-spoof rule: a dotted (BNS) name only survives if it resolves to the member's
// address. A BNS in the address field fills the address and labels the name; a BNS
// in the name field fills an empty address, verifies against a present one, or is
// rejected as a mismatch. `resolve` returns the resolution for a candidate name.
export function reconcileMemberBns(
  member: { addr: string; name: string },
  resolve: (fullName: string) => BnsResolution | undefined
): ReconciledMember {
  const addr = member.addr.trim();
  const name = member.name.trim();

  if (looksLikeBnsName(addr)) {
    const resolution = resolve(addr);
    if (!resolution || resolution.status === 'loading')
      return { addr: member.addr, name: member.name, bns: 'resolving' };
    if (resolution.status === 'not-found')
      return { addr: member.addr, name: member.name, bns: 'not-found' };
    return { addr: resolution.owner, name: name === '' ? addr : member.name, bns: 'none' };
  }

  if (looksLikeBnsName(name)) {
    const resolution = resolve(name);
    if (!resolution || resolution.status === 'loading')
      return { addr: member.addr, name: member.name, bns: 'resolving' };
    if (resolution.status === 'not-found')
      return { addr: member.addr, name: member.name, bns: 'not-found' };
    if (addr === '') return { addr: resolution.owner, name: member.name, bns: 'none' };
    if (addr === resolution.owner) return { addr: member.addr, name: member.name, bns: 'none' };
    return { addr: member.addr, name: member.name, bns: 'mismatch' };
  }

  return { addr: member.addr, name: member.name, bns: 'none' };
}
