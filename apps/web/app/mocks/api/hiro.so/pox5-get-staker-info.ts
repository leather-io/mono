import { contractPrincipalCV, serializeCV, someCV, tupleCV, uintCV } from '@stacks/transactions';

// https://api.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-5/get-staker-info
const path =
  'https://api.hiro.so/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-5/get-staker-info';

// Default variant: no pox-5 position, so the start-staking flow renders.
export const pox5GetStakerInfoNoneHandler = {
  path,
  resp: { okay: true, result: '0x09' },
  method: 'post',
} as const;

// Cycle numbers align with the /v2/pox mock (current cycle 113); the signer
// matches fastPool's mainnet placeholder signer-manager so the position
// resolves to a known pool.
const stakedResult = someCV(
  tupleCV({
    'amount-ustx': uintCV(40_000_000n),
    'first-reward-cycle': uintCV(110n),
    'num-cycles': uintCV(12n),
    signer: contractPrincipalCV(
      'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP',
      'pox5-signer-manager-placeholder'
    ),
  })
);

export const pox5GetStakerInfoStakedHandler = {
  path,
  resp: { okay: true, result: `0x${serializeCV(stakedResult)}` },
  method: 'post',
} as const;
