import { contractPrincipalCV, serializeCV, someCV, tupleCV, uintCV } from '@stacks/transactions';

// The pox-5 read layer is pinned to the private testnet API and the testnet
// pox-5 boot contract.
const path =
  'https://api.testnet-pox5.hiro.so/v2/contracts/call-read/ST000000000000000000002AMW42H/pox-5/get-staker-info';

// Default variant: no pox-5 position, so the start-staking flow renders.
export const pox5GetStakerInfoNoneHandler = {
  path,
  resp: { okay: true, result: '0x09' },
  method: 'post',
} as const;

// Cycle numbers align with the /v2/pox mock (current cycle 113); the signer
// matches the "special" pool's signer-manager so the position resolves to a
// known pool.
const stakedResult = someCV(
  tupleCV({
    'amount-ustx': uintCV(40_000_000n),
    'first-reward-cycle': uintCV(110n),
    'num-cycles': uintCV(12n),
    signer: contractPrincipalCV('ST3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SK5QGMWP', 'signer-manager'),
  })
);

export const pox5GetStakerInfoStakedHandler = {
  path,
  resp: { okay: true, result: `0x${serializeCV(stakedResult)}` },
  method: 'post',
} as const;
