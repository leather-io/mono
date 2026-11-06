import { styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  Avatar,
  PlaceholderIcon,
  SbtcAvatarIcon,
  StxAvatarIcon,
} from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalGuarantee } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { TransferStxHistory } from './activity-histories';
import {
  account1Sbtc,
  account1Stx,
  contracts,
  explorer,
  feeUnderOneCent,
  gamma,
  mainnet,
  stxRecipient,
} from './fixtures';
import type { Scenario } from './scenario';

const sip10Recipient = 'SP2F8VNY5K3T9QH6RAW0XJ4ZDMC7EB1GPSN3KHT8V';
const sip9Recipient = 'SP1K9TWBZ4HNDX7ME2QAVR0JC5G8FSY3P6NTKWB2D';
const nftCollection = 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.bitcoin-monkeys';

interface FeeLineProps {
  value: string;
}

function FeeLine({ value }: FeeLineProps) {
  return (
    <styled.span display="block">
      + <ExactAmount value={value} symbol="STX" />
    </styled.span>
  );
}

export const transferScenarios: Scenario[] = [
  {
    id: 'transfer-stx-large',
    family: 'transfer',
    label: 'Send STX, large amount',
    method: 'stx_transferStx',
    captureId: '06-stx-transfer-stx',
    refs: ['#2587'],
    events: [
      viewed('stx_transferStx', 'transfer', 'none'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'Exact amounts, never “1.23M STX”. The amount leads the screen, trailing zeros are dimmed rather than dropped, and the recipient is a full grouped address because people compare it character by character.',
    history() {
      return <TransferStxHistory />;
    },
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{
                amount: <ExactAmount value="1,234,999.003000" symbol="STX" />,
                fiat: '$1,003,313.19',
              }}
            />
          }
        >
          <ApprovalHeader requester={explorer} account={account1Stx} network={mainnet} />
          <ApprovalIntent title="Send 1,234,999 STX" kind="STX transfer · built by Leather" />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1,234,999.000000" symbol="STX" />}
              fiat="$1,003,313.19"
            />
            <ApprovalRecipientRow
              address={<AddressDisplayer address={stxRecipient} />}
              caption="Memo: invoice 0042"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only this amount and the fee can leave your account. Anything else makes the transfer
              fail.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalDisclosureRow label="All details" caption="Nonce, raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'transfer-sip10',
    family: 'transfer',
    label: 'Send a SIP-10 token (sBTC)',
    method: 'stx_transferSip10Ft · deny mode, built by Leather',
    refs: ['#2624'],
    note: 'A token transfer reads like the STX one: the amount in the title, sBTC to 8 decimals priced as sBTC, and the kind line says when Leather recognises the token contract, so a look-alike cannot pass for it; the contract and its deployer sit in details. Today this screen is titled “Sign transaction”, shows the amount only in the post-condition row and as a raw uint argument, and prices the base units as STX in the total. The total now keeps the token and the STX fee on separate lines instead of converting one into the other.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{
                amount: (
                  <>
                    <styled.span display="block">
                      <ExactAmount value="0.02500000" symbol="sBTC" />
                    </styled.span>
                    <FeeLine value="0.003000" />
                  </>
                ),
                fiat: '$2,744.45',
              }}
            />
          }
        >
          <ApprovalHeader requester={explorer} account={account1Sbtc} network={mainnet} />
          <ApprovalIntent
            title="Send 0.025 sBTC"
            kind="sBTC transfer · token recognised by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="0.02500000" symbol="sBTC" />}
              fiat="$2,744.45"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={sip10Recipient} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only this sBTC and the STX fee can leave your account. Anything else makes the
              transfer fail.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Token contract, function, nonce"
          >
            <ApprovalContractRow
              label="Token contract"
              contractId={contracts.sbtcToken}
              caption="recognised by Leather"
            />
            <ApprovalDisclosureRow
              label="All details"
              caption="Function, arguments, nonce, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'transfer-sip9',
    family: 'transfer',
    label: 'Send an NFT (SIP-9)',
    method: 'stx_transferSip9Nft · deny mode, built by Leather',
    refs: ['#2587'],
    note: 'The NFT is named in the title and its token ID sits under the collection name, because two items in one collection differ only by that number. Today the post condition shows a three-letter ticker and no ID, which only appears as a raw function argument. Leather builds the transfer and its post condition, so the guarantee is strict and the total is the item plus the STX fee.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{
                amount: (
                  <>
                    <styled.span display="block">Bitcoin Monkeys #1234</styled.span>
                    <FeeLine value="0.003000" />
                  </>
                ),
              }}
            />
          }
        >
          <ApprovalHeader requester={gamma} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Send Bitcoin Monkeys #1234"
            kind="NFT transfer · built by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<Avatar size="md" variant="square" icon={<PlaceholderIcon />} />}
              label="You send"
              qualifier="Exactly this item"
              amount="Bitcoin Monkeys"
              fiat="Token ID 1234"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={sip9Recipient} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only this NFT and the STX fee can leave your account. Anything else makes the transfer
              fail.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Collection, function, nonce"
          >
            <ApprovalContractRow label="Collection" contractId={nftCollection} />
            <ApprovalDisclosureRow
              label="All details"
              caption="Function, arguments, nonce, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
