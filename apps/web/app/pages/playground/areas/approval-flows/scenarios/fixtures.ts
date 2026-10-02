import type { ApprovalSignerEntry } from '../pattern/approval-signers';
import type {
  ApprovalAccount,
  ApprovalNetwork,
  ApprovalRequester,
} from '../pattern/approval-types';

export const mainnet: ApprovalNetwork = { id: 'mainnet', name: 'Mainnet' };
export const testnet: ApprovalNetwork = { id: 'testnet', name: 'Testnet' };

export const account1: ApprovalAccount = {
  name: 'Account 1',
  index: 0,
  address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  icon: 'orange',
  signer: 'software',
};

export const account1Stx: ApprovalAccount = {
  ...account1,
  balance: { amount: '1,402,118.550000', symbol: 'STX', fiat: '$1,139,081.11' },
};

export const account1Sbtc: ApprovalAccount = {
  ...account1,
  balance: { amount: '0.48210000', symbol: 'sBTC', fiat: '$52,923.97' },
};

export const account3: ApprovalAccount = {
  name: 'Account 3',
  index: 2,
  address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
  icon: 'saturn',
  signer: 'software',
};

export const ledgerAccount: ApprovalAccount = {
  name: 'Account 2',
  index: 1,
  address: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
  icon: 'rocket',
  signer: 'ledger',
  balance: { amount: '12,480.250000', symbol: 'STX', fiat: '$10,138.96' },
};

export const vaultAccount: ApprovalAccount = {
  name: 'Account 1',
  index: 0,
  address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  icon: 'orange',
  signer: 'software',
  balance: { amount: '248,500.000000', symbol: 'STX', fiat: '$201,881.40' },
  vault: {
    name: 'Team Treasury',
    threshold: '2 of 3',
    address: 'SM2Z7N4VJ1Q4F6Y2HX9QZD6N8W0KXB3T5R7M4J9PA',
  },
};

type VaultMember = Omit<ApprovalSignerEntry, 'status' | 'detail'>;

export const vaultYou: VaultMember = {
  name: 'Account 1 (you)',
  device: 'extension',
  account: account1,
};

export const vaultMember2: VaultMember = { name: 'Member 2', device: 'ledger' };

export const vaultMember3: VaultMember = { name: 'Member 3', device: 'mobile' };

export const vaultRequiredSignatures = 2;

export const stxVaultRecipient = 'SP3QRZ8XWE5M2V6N1TDK9AF4HGB7C0JYSPW2ETR6M';

export const btcAccount1 = {
  nativeSegwit: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  taproot: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297',
};

export const btcSigner: ApprovalAccount = {
  ...account1,
  address: btcAccount1.nativeSegwit,
  balance: { amount: '0.08421530', symbol: 'BTC', fiat: '$9,244.99' },
};

export const btcVaultAddress = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

export const btcVault: ApprovalAccount = {
  ...vaultAccount,
  address: btcAccount1.nativeSegwit,
  balance: { amount: '1.84250000', symbol: 'BTC', fiat: '$202,265.97' },
  vault: { name: 'Team Treasury', threshold: '2 of 3', address: btcVaultAddress },
};

export const feeUnderOneCent = '< $0.01';

export const stxRecipient = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';

export const vaultProposalSigned =
  'Your signature is included: Propose signs the commitment and the transaction with Account 1’s key, and nothing moves yet.';

export const vaultBroadcastRule = 'It can be broadcast once 2 of 3 Team Treasury signers approve.';

export const bitflow: ApprovalRequester = {
  origin: 'https://app.bitflow.finance',
  connection: 'connected',
};

export const leatherApp: ApprovalRequester = {
  origin: 'https://app.leather.io',
  connection: 'connected',
};

export const stackingDao: ApprovalRequester = {
  origin: 'https://app.stackingdao.com',
  connection: 'connected',
};

export const sbtcBridge: ApprovalRequester = {
  origin: 'https://sbtc.stacks.co',
  connection: 'connected',
};

export const gamma: ApprovalRequester = {
  origin: 'https://gamma.io',
  connection: 'connected',
};

export const explorer: ApprovalRequester = {
  origin: 'https://explorer.hiro.so',
  connection: 'connected',
};

export const zest: ApprovalRequester = {
  origin: 'https://app.zestprotocol.com',
  connection: 'connected',
};

export const newSite: ApprovalRequester = {
  origin: 'https://app.bitflow.finance',
  connection: 'not-connected',
};

export const walletConnectSite: ApprovalRequester = {
  origin: 'https://app.bitflow.finance',
  connection: 'not-connected',
  transport: 'walletconnect',
};

export const localDapp: ApprovalRequester = {
  origin: 'http://localhost:3000',
  connection: 'connected',
};

export const embeddedApp: ApprovalRequester = {
  origin: 'https://stx.asigna.io',
  frameOrigin: 'https://app.velar.com',
  connection: 'connected',
};

export const contracts = {
  bitflowSwap: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-swap-helper-v-1-3',
  sbtcToken: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  pox5: 'SP000000000000000000002Q6VF78.pox-5',
  signerManager: 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fast-pool-signer-v1',
  zestBorrowHelper: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v2-1',
  velarRouter: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router',
  sbtcWithdrawal: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-withdrawal',
};

export const dryRunSource = 'Leather’s dry run';
