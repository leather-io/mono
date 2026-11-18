import { atom } from 'jotai';

// Version of the installed extension once a multisig RPC call has been refused
// for being too old; null until that happens.
export const outdatedExtensionVersionAtom = atom<string | null>(null);
