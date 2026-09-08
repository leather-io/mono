// The wallet sign-in handshake, exactly as the multisig dApp performs it.
//
// It is two requests with an assertion between them, and that assertion is the
// interesting part: `getAddresses` and `signMessage` are separate prompts, so
// the user can switch account in between and the dApp would otherwise register
// one key while authenticating another.
import { type Scenario, networkOf } from '../types';
import { extractXpub, fetchAddresses, pickBtcEntry } from '../wallet';

export const signInHandshake: Scenario = {
  id: 'sign-in-handshake',
  label: 'Wallet sign-in handshake',
  description:
    'getAddresses({ chains: ["bitcoin"] }) → signMessage over a timestamped challenge → assert the signature came back for the SAME address. Mirrors the multisig dApp’s walletSignIn.',
  tags: ['multisig', 'scenario', 'ci'],
  steps: [
    {
      id: 'get-addresses',
      label: 'Ask for Bitcoin addresses',
      async run({ ctx }) {
        const addresses = await fetchAddresses(ctx, { chains: ['bitcoin'] });
        const entry = pickBtcEntry(addresses, 'p2wpkh');
        if (!entry.descriptor || !entry.publicKey)
          throw new Error('p2wpkh entry is missing its descriptor or publicKey');
        return {
          summary: entry.address,
          state: {
            address: entry.address,
            publicKey: entry.publicKey,
            xpub: extractXpub(entry.descriptor),
            derivationPath: entry.derivationPath,
          },
          checks: [
            {
              label: 'response carries no STX entries',
              ok: !addresses.some(a => a.symbol === 'STX'),
            },
            { label: 'descriptor yields an xpub', ok: true, detail: extractXpub(entry.descriptor) },
          ],
        };
      },
    },
    {
      id: 'sign-challenge',
      label: 'Sign the challenge',
      async run({ ctx, state }) {
        const address = typeof state.address === 'string' ? state.address : undefined;
        if (!address) throw new Error('Run the getAddresses step first');
        const timestamp = Date.now();
        const message = `Sign in to the Leather RPC test app\n${timestamp}`;
        const result = await ctx.request('signMessage', {
          message,
          paymentType: 'p2wpkh',
          network: networkOf(ctx),
        });
        const signed = result as { address?: string; signature?: string };
        return {
          summary: signed.address ?? 'no address in response',
          state: { signature: signed.signature, message, timestamp },
          checks: [
            { label: 'a signature came back', ok: !!signed.signature },
            {
              label: 'signed by the address that was shared',
              ok: signed.address === address,
              detail:
                signed.address === address
                  ? undefined
                  : `shared ${address}, signed ${signed.address} — the active account changed mid-flow`,
            },
          ],
        };
      },
    },
  ],
};
