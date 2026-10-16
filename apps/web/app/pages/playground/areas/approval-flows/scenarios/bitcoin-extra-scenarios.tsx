import { type ChangeEvent, type ReactNode, useState } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  Avatar,
  BtcAvatarIcon,
  Button,
  GridIcon,
  Input,
  LockIcon,
} from '@leather.io/ui';

import {
  cautionShown,
  decided,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
import {
  HandshakeLabelRow,
  HandshakeTile,
  HandshakeValueRow,
} from '../directions/handshake-primitives';
import { ApprovalChoice, ApprovalChoiceList } from '../pattern/approval-choice';
import { type ApprovalConfirmation } from '../pattern/approval-confirm';
import {
  type ApprovalFeeSpeed,
  type ApprovalLines,
  useApprovalDirection,
} from '../pattern/approval-direction';
import { ApprovalFeeIcon } from '../pattern/approval-fee-speed';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { RecipientAvatar } from '../pattern/approval-identity';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { approvalIconTile } from '../pattern/approval-surface';
import { ApprovalSwitchRow } from '../pattern/approval-switch-row';
import { ApprovalTray } from '../pattern/approval-tray';
import type { ApprovalAccount, ApprovalRequester } from '../pattern/approval-types';
import { PsbtLegRow, depositAddress } from './bitcoin-parts';
import { btcAccount1, btcSigner, gamma, mainnet, sbtcBridge } from './fixtures';
import type { Scenario } from './scenario';

const btcUsdRate = 109778;

const satsPerBtc = 100_000_000;

const standardFeeCaption = '5 sat/vB · about 30 min';

const outputsFinalText =
  'Your signature covers every input and output. If anything changes, it no longer counts.';

function formatBtc(sats: number) {
  return (sats / satsPerBtc).toFixed(8);
}

function formatUsd(sats: number) {
  return ((sats / satsPerBtc) * btcUsdRate).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

interface BtcSendScreenProps {
  signer: ApprovalAccount;
  requester: ApprovalRequester;
  title: string;
  amount: string;
  fiat: string;
  fee: string;
  feeFiat: string;
  feeCaption?: ApprovalLines;
  payingFrom: string;
  total: string;
  totalFiat: string;
  caution?: ReactNode;
  confirmation?: ApprovalConfirmation;
  overlay?: ReactNode;
}

function BtcSendScreen({
  signer,
  requester,
  title,
  amount,
  fiat,
  fee,
  feeFiat,
  feeCaption = standardFeeCaption,
  payingFrom,
  total,
  totalFiat,
  caution,
  confirmation,
  overlay,
}: BtcSendScreenProps) {
  return (
    <ApprovalShell
      overlay={overlay}
      footer={
        <ApprovalFooter
          primaryLabel="Send"
          confirmation={confirmation}
          total={{ amount: <ExactAmount value={total} symbol="BTC" />, fiat: totalFiat }}
        />
      }
    >
      <ApprovalHeader requester={requester} account={signer} network={mainnet} />
      <ApprovalIntent title={title} kind="Bitcoin transfer · built by Leather" />
      {caution}
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value={amount} symbol="BTC" />}
          fiat={fiat}
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
        <ApprovalRow
          label="Paying from"
          value="Native SegWit"
          caption={payingFrom}
          action={<ApprovalRowAction label="Edit sources" />}
        />
        <ApprovalFeeRow
          amount={<ExactAmount value={fee} symbol="BTC" />}
          fiat={feeFiat}
          speed="standard"
          caption={feeCaption}
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="final">{outputsFinalText}</ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection
        label="Details"
        divided
        collapsible
        summary="Inputs and outputs, raw transaction"
      >
        <ApprovalDisclosureRow label="All details" caption="Inputs and outputs, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

const sourcesSigner: ApprovalAccount = {
  ...btcSigner,
  balance: { amount: '0.01571130', symbol: 'BTC', fiat: '$1,724.76' },
};

type SourceChoiceId = 'native-segwit' | 'taproot' | 'both';

interface SourceChoiceOption {
  id: SourceChoiceId;
  label: string;
  caption: ReactNode;
  spendable: string;
  spendableFiat: string;
  fee: string;
  feeFiat: string;
  coinsIn: string;
  detail?: string;
}

const sourceChoices: SourceChoiceOption[] = [
  {
    id: 'native-segwit',
    label: 'Native SegWit only',
    caption: (
      <>
        Recommended ·{' '}
        <styled.span whiteSpace="nowrap">{truncateMiddle(btcAccount1.nativeSegwit, 4)}</styled.span>
      </>
    ),
    spendable: '0.00940000',
    spendableFiat: '$1,031.91',
    fee: '0.00001105',
    feeFiat: '$1.21',
    coinsIn: '2 coins in',
  },
  {
    id: 'taproot',
    label: 'Taproot only',
    caption: truncateMiddle(btcAccount1.taproot, 4),
    spendable: '0.00600000',
    spendableFiat: '$658.67',
    fee: '0.00000710',
    feeFiat: '$0.78',
    coinsIn: '1 coin in',
    detail:
      'Taproot is where Leather keeps collectibles. Protected coins stay out, but check this address holds nothing else you want to keep.',
  },
  {
    id: 'both',
    label: 'Both',
    caption: 'Leather uses the fewest coins',
    spendable: '0.01540000',
    spendableFiat: '$1,690.58',
    fee: '0.00000710',
    feeFiat: '$0.78',
    coinsIn: '1 coin in',
    detail: 'For this send the fewest coins is the one Taproot coin, so Taproot pays.',
  },
];

interface ProtectedCoinRowProps {
  title: string;
  coins: string;
  amount: string;
}

function ProtectedCoinRow({ title, coins, amount }: ProtectedCoinRowProps) {
  const isHandshake = useApprovalDirection()?.id === 'handshake';
  if (isHandshake) {
    return (
      <Stack gap="space.02" py="space.02" minWidth={0}>
        <HandshakeLabelRow label={title} />
        <HandshakeValueRow
          icon={
            <HandshakeTile>
              <LockIcon variant="small" color="ink.text-subdued" />
            </HandshakeTile>
          }
        >
          <Stack gap="0" minWidth={0}>
            <styled.span textStyle="label.02">
              <ExactAmount value={amount} symbol="BTC" />
            </styled.span>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {coins}
            </styled.span>
          </Stack>
        </HandshakeValueRow>
      </Stack>
    );
  }
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.02">
      <Flex width="20px" justifyContent="center" pt="2px" flexShrink={0} lineHeight={0}>
        <LockIcon variant="small" color="ink.text-subdued" />
      </Flex>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02">{title}</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {coins} · <ExactAmount value={amount} symbol="BTC" />
        </styled.span>
      </Stack>
    </Flex>
  );
}

function findSourceChoice(id: SourceChoiceId) {
  return sourceChoices.find(choice => choice.id === id) ?? sourceChoices[0];
}

function SourcesSheet() {
  const [selectedId, setSelectedId] = useState<SourceChoiceId>('native-segwit');
  const selected = findSourceChoice(selectedId);
  return (
    <ApprovalTray
      title="Pay from"
      maxHeight="90%"
      footer={
        <Stack gap="space.03">
          <Flex justifyContent="space-between" alignItems="baseline" gap="space.04">
            <styled.span textStyle="label.03" color="ink.text-subdued">
              Network fee · {selected?.coinsIn}
            </styled.span>
            <styled.span textStyle="label.03">
              <ExactAmount value={selected?.fee ?? ''} symbol="BTC" /> · {selected?.feeFiat}
            </styled.span>
          </Flex>
          <Button size="lg" fullWidth>
            Done
          </Button>
        </Stack>
      }
    >
      <ApprovalSection>
        <ApprovalChoiceList label="Pay from">
          {sourceChoices.map(choice => (
            <ApprovalChoice
              key={choice.id}
              label={choice.label}
              caption={[choice.caption, `Fee ${choice.feeFiat} · ${choice.coinsIn}`]}
              value={<ExactAmount value={choice.spendable} symbol="BTC" />}
              valueCaption={choice.spendableFiat}
              isSelected={choice.id === selectedId}
              onSelect={() => setSelectedId(choice.id)}
            >
              {choice.detail && (
                <styled.p textStyle="caption.01" color="ink.text-subdued">
                  {choice.detail}
                </styled.p>
              )}
            </ApprovalChoice>
          ))}
        </ApprovalChoiceList>
      </ApprovalSection>
      <ApprovalSection label="Protected, left out" divided>
        <ProtectedCoinRow
          title="May hold an inscription"
          coins="1 Taproot coin"
          amount="0.00012000"
        />
        <ProtectedCoinRow
          title="Under 10,000 sats"
          coins="3 small Taproot coins"
          amount="0.00019130"
        />
        <ApprovalSwitchRow
          title="Let this send use protected coins"
          caption="Only if they hold nothing you want to keep"
        />
      </ApprovalSection>
    </ApprovalTray>
  );
}

const sourcesSendProps = {
  signer: sourcesSigner,
  requester: sbtcBridge,
  title: 'Send 0.005 BTC',
  amount: '0.00500000',
  fiat: '$548.89',
  fee: '0.00001105',
  feeFiat: '$1.21',
  payingFrom: `${truncateMiddle(btcAccount1.nativeSegwit, 4)} · 2 coins · change returns here`,
  total: '0.00501105',
  totalFiat: '$550.10',
};

const txVirtualBytes = 153;

interface FeeTier {
  id: ApprovalFeeSpeed;
  label: string;
  rate: number;
  time: string;
}

const feeTiers: FeeTier[] = [
  { id: 'slow', label: 'Slow', rate: 2, time: 'About 2 hours' },
  { id: 'standard', label: 'Standard', rate: 5, time: 'About 30 min' },
  { id: 'fast', label: 'Fast', rate: 9, time: 'About 10 min' },
];

const customTierId: ApprovalFeeSpeed = 'custom';

const lowestTierRate = 2;

const highRateMultiple = 3;

const fastestTierRate = 9;

function customRateHint(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) return 'Enter a rate in sat/vB.';
  if (rate < lowestTierRate) return 'Below Slow. It may take days to confirm, or never.';
  if (rate >= fastestTierRate * highRateMultiple) {
    return 'At least 3 times Fast. It won’t confirm much sooner, and you pay more.';
  }
  return 'Leather checks the rate against recent blocks before you send.';
}

interface FeeAmountProps {
  sats: number;
}

function FeeAmount({ sats }: FeeAmountProps) {
  return <ExactAmount value={formatBtc(sats)} symbol="BTC" />;
}

function FeeSheet() {
  const [selectedId, setSelectedId] = useState<ApprovalFeeSpeed>('standard');
  const [customRate, setCustomRate] = useState('');
  const customRateValue = Number(customRate);
  const selectedTier = feeTiers.find(tier => tier.id === selectedId);
  const selectedRate = selectedTier ? selectedTier.rate : customRateValue;
  const selectedSats = Number.isFinite(selectedRate) ? selectedRate * txVirtualBytes : 0;
  return (
    <ApprovalTray
      title="Network fee"
      maxHeight="88%"
      footer={
        <Stack gap="space.03">
          <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
            <Stack gap="0">
              <styled.span textStyle="label.02">{selectedTier?.label ?? 'Custom'}</styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {txVirtualBytes} vB × {Number.isFinite(selectedRate) ? selectedRate : 0} sat/vB
              </styled.span>
            </Stack>
            <Stack gap="0" alignItems="flex-end" textAlign="right">
              <styled.span textStyle="label.02">
                <FeeAmount sats={selectedSats} />
              </styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {formatUsd(selectedSats)}
              </styled.span>
            </Stack>
          </Flex>
          <Button size="lg" fullWidth>
            Done
          </Button>
        </Stack>
      }
    >
      <ApprovalSection label="How fast">
        <ApprovalChoiceList label="How fast">
          {feeTiers.map(tier => (
            <ApprovalChoice
              key={tier.id}
              label={tier.label}
              icon={<ApprovalFeeIcon speed={tier.id} />}
              caption={tier.time}
              value={<FeeAmount sats={tier.rate * txVirtualBytes} />}
              valueCaption={`${tier.rate} sat/vB · ${formatUsd(tier.rate * txVirtualBytes)}`}
              isSelected={tier.id === selectedId}
              onSelect={() => setSelectedId(tier.id)}
            />
          ))}
          <ApprovalChoice
            label="Custom"
            icon={<ApprovalFeeIcon speed={customTierId} />}
            caption="Set your own rate"
            isSelected={selectedId === customTierId}
            onSelect={() => setSelectedId(customTierId)}
          >
            <Stack gap="space.02">
              <Input.Root>
                <Input.Label>Rate in sat/vB</Input.Label>
                <Input.Field
                  inputMode="decimal"
                  value={customRate}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCustomRate(event.target.value)
                  }
                />
              </Input.Root>
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {customRateHint(customRateValue)}
              </styled.p>
            </Stack>
          </ApprovalChoice>
        </ApprovalChoiceList>
      </ApprovalSection>
      <ApprovalNote>
        Fees are priced per unit of size, in sat/vB. This transaction is {txVirtualBytes} vB;
        sending more bitcoin doesn’t make it bigger. Times are Leather’s estimate from recent
        blocks.
      </ApprovalNote>
    </ApprovalTray>
  );
}

const multiRequester: ApprovalRequester = {
  origin: 'https://payouts.example',
  connection: 'connected',
};

interface MultiRecipient {
  address: string;
  amount: string;
  fiat: string;
}

const multiRecipients: MultiRecipient[] = [
  {
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    amount: '0.00500000',
    fiat: '$548.89',
  },
  {
    address: 'bc1qc7slrfxkknqcq2jevvvkdgvrt8080852dfjewde',
    amount: '0.00250000',
    fiat: '$274.45',
  },
  {
    address: 'bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c',
    amount: '0.00100000',
    fiat: '$109.78',
  },
];

interface MultiRecipientRowProps {
  recipient: MultiRecipient;
  position: number;
}

function MultiRecipientRow({ recipient, position }: MultiRecipientRowProps) {
  const isHandshake = useApprovalDirection()?.id === 'handshake';
  if (isHandshake) {
    return (
      <Stack gap="space.02" py="space.02" minWidth={0} data-approval-zone="recipient">
        <HandshakeLabelRow
          label="Recipient"
          trailing={
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {position} of {multiRecipients.length}
            </styled.span>
          }
        />
        <HandshakeValueRow icon={<RecipientAvatar size="sm" />}>
          <Stack gap="0" minWidth={0}>
            <styled.span textStyle="label.02">
              <ExactAmount value={recipient.amount} symbol="BTC" />
            </styled.span>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {recipient.fiat}
            </styled.span>
            <AddressDisplayer address={recipient.address} textStyle="code" />
          </Stack>
        </HandshakeValueRow>
      </Stack>
    );
  }
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.02" data-approval-zone="recipient">
      <Flex width="32px" justifyContent="center" flexShrink={0}>
        <RecipientAvatar size="sm" />
      </Flex>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          To · {position} of {multiRecipients.length}
        </styled.span>
        <styled.span textStyle="address" whiteSpace="nowrap">
          {truncateMiddle(recipient.address, 8)}
        </styled.span>
      </Stack>
      <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0}>
        <styled.span textStyle="label.02">
          <ExactAmount value={recipient.amount} symbol="BTC" />
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {recipient.fiat}
        </styled.span>
      </Stack>
    </Flex>
  );
}

function MultiDetailsTray() {
  return (
    <ApprovalTray title="Inputs and outputs" maxHeight="73%">
      <ApprovalSection label="Inputs · you sign both">
        <PsbtLegRow index={0} tag="yours" address={btcAccount1.nativeSegwit} amount="0.00600000" />
        <PsbtLegRow index={1} tag="yours" address={btcAccount1.nativeSegwit} amount="0.00400000" />
      </ApprovalSection>
      <ApprovalSection label="Outputs" divided>
        {multiRecipients.map((recipient, index) => (
          <PsbtLegRow
            key={recipient.address}
            index={index}
            tag="external"
            address={recipient.address}
            amount={recipient.amount}
            caption={`Recipient ${index + 1} of ${multiRecipients.length}`}
          />
        ))}
        <PsbtLegRow
          index={multiRecipients.length}
          tag="change"
          address={btcAccount1.nativeSegwit}
          amount="0.00148645"
          caption="The one change output, back to Native SegWit"
        />
      </ApprovalSection>
      <ApprovalSection divided>
        <ApprovalRow
          label="Fee · inputs minus outputs"
          value={<ExactAmount value="0.00001355" symbol="BTC" />}
          caption="271 vB × 5 sat/vB"
        />
      </ApprovalSection>
    </ApprovalTray>
  );
}

interface MultiSendProps {
  overlay?: ReactNode;
}

function MultiSend({ overlay }: MultiSendProps) {
  return (
    <ApprovalShell
      overlay={overlay}
      footer={
        <ApprovalFooter
          primaryLabel="Send"
          total={{ amount: <ExactAmount value="0.00851355" symbol="BTC" />, fiat: '$934.60' }}
        />
      }
    >
      <ApprovalHeader requester={multiRequester} account={btcSigner} network={mainnet} />
      <ApprovalIntent
        title="Send 0.0085 BTC to 3 recipients"
        kind="Bitcoin transfer · built by Leather"
      />
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly, split 3 ways"
          amount={<ExactAmount value="0.00850000" symbol="BTC" />}
          fiat="$933.11"
        />
        {multiRecipients.map((recipient, index) => (
          <MultiRecipientRow key={recipient.address} recipient={recipient} position={index + 1} />
        ))}
        <ApprovalRow
          label="Paying from"
          value="Native SegWit"
          caption={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · 2 coins · change returns here`}
          action={<ApprovalRowAction label="Edit sources" />}
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.00001355" symbol="BTC" />}
          fiat="$1.49"
          speed="standard"
          caption={['5 sat/vB · about 30 min', 'One fee for all 3 recipients']}
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="final">{outputsFinalText}</ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection
        label="Details"
        divided
        collapsible
        summary="Full addresses, inputs and outputs"
      >
        <ApprovalDisclosureRow
          label="Inputs and outputs"
          caption="2 in, 4 out, full recipient addresses"
        />
      </ApprovalSection>
    </ApprovalShell>
  );
}

const listingInscription = '71,234,567';

function ListingPsbt() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Sign"
          total={{
            label: 'You get if it sells',
            amount: <ExactAmount value="0.00420000" symbol="BTC" />,
            fiat: '$461.07',
          }}
        />
      }
    >
      <ApprovalHeader requester={gamma} account={btcSigner} network={mainnet} />
      <ApprovalIntent
        title="List 1 inscription for 0.0042 BTC"
        kind="PSBT · a listing, built by gamma.io"
      />
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={
            <Avatar
              size="md"
              variant="square"
              icon={<GridIcon variant="small" />}
              className={approvalIconTile}
            />
          }
          label="You give"
          qualifier={`Taproot · #${listingInscription}`}
          amount="1 inscription"
          fiat="Only if someone buys"
        />
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You get"
          qualifier={`Native SegWit · ${truncateMiddle(btcAccount1.nativeSegwit, 4)}`}
          amount={<ExactAmount value="0.00420000" symbol="BTC" />}
          fiat="$461.07"
          direction="in"
        />
        <ApprovalFeeRow
          amount="None now"
          caption="The buyer pays the network fee when they complete the trade"
        />
        <ApprovalGuarantee kind="open">
          The buyer can add their coins and outputs, but the payment to you is fixed.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="How long it lasts" divided>
        <ApprovalRow
          stacked
          label="Stays valid"
          value="Until the coin is spent or you cancel the listing"
          caption="There’s no expiry date. Anyone who has this signed listing can complete it."
        />
        <ApprovalRow
          stacked
          label="To cancel"
          value="Leather moves the inscription to a new coin"
          caption="That’s a transaction, so it costs a network fee. Taking the listing down on gamma.io alone doesn’t stop a copy someone already has."
        />
      </ApprovalSection>
      <ApprovalNote>
        Leather signs your one input and returns the listing to gamma.io, which shows it to buyers.
        Nothing moves until someone buys.
      </ApprovalNote>
      <ApprovalSection
        label="Details"
        divided
        collapsible
        summary="Signature type, inputs and outputs"
      >
        <ApprovalRow
          label="Signature type"
          value={<ApprovalIdentifier>SINGLE|ANYONECANPAY</ApprovalIdentifier>}
          caption="Covers input #0 and output #0 only"
        />
        <ApprovalDisclosureRow label="Inputs and outputs" caption="1 in, 1 out, raw PSBT" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

const mintSite: ApprovalRequester = {
  origin: 'https://mint.example',
  connection: 'connected',
};

function SighashNonePsbt() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Sign"
          blockedReason="Leather won’t sign your coins without the outputs covered."
        />
      }
    >
      <ApprovalHeader requester={mintSite} account={btcSigner} network={mainnet} />
      <ApprovalIntent
        title="Leather won’t sign this"
        kind="PSBT · asks for a signature that leaves the outputs open · built by mint.example"
      />
      <ApprovalCaution
        tone="blocking"
        title="This signature works like a blank cheque"
        source="Leather’s signature-type check"
      >
        The site asks you to sign your coin with SIGHASH_NONE, which says nothing about where the
        bitcoin goes. Anyone who gets this signature could send the coin anywhere.
      </ApprovalCaution>
      <ApprovalSection label="What it asked for">
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="Your coin"
          qualifier="Input #0 · Native SegWit"
          amount={<ExactAmount value="0.01800000" symbol="BTC" />}
          fiat="$1,976.00"
        />
        <ApprovalRow
          label="Signature type"
          value={<ApprovalIdentifier>NONE|ANYONECANPAY</ApprovalIdentifier>}
          caption="Covers your coin, none of the outputs"
        />
      </ApprovalSection>
      <ApprovalSection label="What you can do" divided>
        <styled.p textStyle="body.02" py="space.02">
          Nothing was signed. Trades and payments don’t need this signature type, so if you expected
          one, ask the site why it wants it.
        </styled.p>
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const bitcoinSendExtraScenarios: Scenario[] = [
  {
    id: 'send-transfer-edit-sources',
    family: 'bitcoin',
    label: 'Choose which address pays',
    method: 'sendTransfer · Edit sources sheet',
    refs: ['#2738', '#2462', '#1381'],
    note: 'Edit sources opens a sheet with three choices: Native SegWit only, Taproot only or both, each with what it can spend and the fee it leads to. A Bitcoin balance is made of separate coins, and a transaction spends whole coins, so the choice changes how many coins go in and so the fee: here Native SegWit needs two coins and costs a little more, while Taproot pays with one. Native SegWit is the recommended default because Taproot is where Leather keeps collectibles. Coins that may hold an inscription, and Taproot coins under 10,000 sats, sit under Protected and are left out unless you switch them on. Today Leather draws from both addresses, largest coins first, and can’t tell which coins hold collectibles; the collectible check needs asset data the coin list doesn’t have yet, so until then only the size rule applies. Whether a site can pin the source is a follow-up.',
    render() {
      return <BtcSendScreen {...sourcesSendProps} overlay={<SourcesSheet />} />;
    },
  },
  {
    id: 'send-transfer-paying-from',
    family: 'bitcoin',
    label: 'Send BTC after choosing Native SegWit',
    method: 'sendTransfer · source chosen',
    refs: ['#2738', '#2587'],
    note: 'The main screen after the sheet: one Paying from row names Native SegWit, how many coins go in and that change returns there, with Edit sources to reopen the sheet. No Taproot caution appears because no Taproot coin is spent. The fee is the Native SegWit one from the sheet, so what the sheet promised is what this screen signs.',
    render() {
      return <BtcSendScreen {...sourcesSendProps} />;
    },
  },
  {
    id: 'send-transfer-fee-editor',
    family: 'bitcoin',
    label: 'Edit the network fee',
    method: 'sendTransfer · fee sheet',
    refs: ['#2738'],
    note: 'Edit on the fee opens a sheet with Slow, Standard and Fast, each with its rate, the fee in BTC and dollars and a time estimate, plus Custom for your own rate. Bitcoin fees are priced by size, not by amount: the rate is in sat/vB, satoshis per unit of transaction size, and this transaction is 153 vB, so Standard at 5 sat/vB comes to 765 sats. A higher rate gets picked up by miners sooner. Custom warns below Slow, where it may never confirm, and at 3 times Fast or more, where it costs more for no real gain. Today’s editor has the same four choices. Only transactions Leather builds get this sheet; on PSBTs others have signed the fee is locked.',
    render() {
      return (
        <BtcSendScreen
          signer={btcSigner}
          requester={sbtcBridge}
          title="Send 0.003 BTC"
          amount="0.00300000"
          fiat="$329.33"
          fee="0.00000765"
          feeFiat="$0.84"
          payingFrom={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · change returns here`}
          total="0.00300765"
          totalFiat="$330.17"
          overlay={<FeeSheet />}
        />
      );
    },
  },
  {
    id: 'send-transfer-high-fee',
    family: 'bitcoin',
    label: 'The fee is a large share of the send',
    method: 'sendTransfer · fee over 10% of the amount',
    refs: ['#2738'],
    events: [
      viewed('sendTransfer', 'bitcoin_send', 'caution'),
      cautionShown('fee_ratio'),
      frictionCompleted('acknowledge'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'A small send where the network fee is 15% of the amount. The fee depends on the transaction’s size, not on how much bitcoin moves, so small sends pay proportionally more. A caution says so above what moves, and Send stays off until you switch on a line naming the fact. The same caution would appear when a custom rate is far above Fast, for example 50 typed instead of 5. sendTransfer doesn’t let a site set the rate, so here it only guards against your own edits and small amounts; on signPsbt, where the app sets the fee, the same check would compare the app’s rate with Leather’s estimate. Today Bitcoin sends have no fee warning at all; the in-wallet Stacks send has one, as a dialog after you press send.',
    render() {
      return (
        <BtcSendScreen
          signer={btcSigner}
          requester={sbtcBridge}
          title="Send 0.00005 BTC"
          amount="0.00005000"
          fiat="$5.49"
          fee="0.00000765"
          feeFiat="$0.84"
          feeCaption={[standardFeeCaption, '15% of what you send']}
          payingFrom={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · change returns here`}
          total="0.00005765"
          totalFiat="$6.33"
          confirmation={{
            mode: 'acknowledge',
            statement: 'I’m fine paying a fee of 15% of this send',
          }}
          caution={
            <ApprovalCaution
              title="The fee is 15% of what you send"
              source="Leather, comparing the fee with the amount"
            >
              The fee depends on the transaction’s size, not the amount, so small sends pay more for
              each bitcoin. Sending more at once, or later when fees are lower, costs less.
            </ApprovalCaution>
          }
        />
      );
    },
  },
  {
    id: 'send-transfer-multi',
    family: 'bitcoin',
    label: 'Send BTC to several recipients',
    method: 'sendTransfer · recipients[]',
    note: 'One request can pay several addresses at once, because a Bitcoin transaction can have many outputs. You send states the total, each recipient gets its own row with its amount and a shortened address, and there is one fee for the whole transaction. The shortened addresses keep the block readable for three recipients; the full addresses are one tap away in details. Today each recipient repeats a full You’ll send and To address block, so three recipients take several screens of scrolling and the only total is the dollar amount by the buttons.',
    render() {
      return <MultiSend />;
    },
  },
  {
    id: 'send-transfer-multi-details',
    family: 'bitcoin',
    label: 'Several recipients, details open',
    method: 'sendTransfer · recipients[] · details tray',
    note: 'The details tray for the multi-recipient send. Each recipient is its own output, tagged External, in the order the site listed them. Whatever is left over comes back as one change output to Native SegWit, counted once no matter how many recipients there are, and the fee is what the inputs hold minus what the outputs pay.',
    render() {
      return <MultiSend overlay={<MultiDetailsTray />} />;
    },
  },
];

export const bitcoinPsbtExtraScenarios: Scenario[] = [
  {
    id: 'sign-psbt-listing',
    family: 'bitcoin',
    label: 'List an inscription for sale',
    method: 'signPsbt · your input SINGLE|ANYONECANPAY',
    refs: ['#2587'],
    note: 'A marketplace listing. You sign only your own coin, the one carrying the inscription, together with the one output that pays you; that is what SINGLE|ANYONECANPAY means. A buyer later adds their own coins and outputs to complete the trade, so the guarantee says outputs can change but the payment to you is fixed. Nothing moves now and there is no fee now. The listing has no expiry: it stays valid until that coin is spent, and cancelling means moving the inscription to a new coin, which costs a fee. Today Leather refuses this signature type unless the site lists it in allowedSighash, and then shows a generic “details are not guaranteed” caution.',
    render() {
      return <ListingPsbt />;
    },
  },
  {
    id: 'sign-psbt-sighash-none',
    family: 'bitcoin',
    label: 'A signature that leaves the outputs open',
    method: 'signPsbt · your input SIGHASH_NONE',
    refs: ['#2587'],
    events: [
      viewed('signPsbt', 'psbt', 'blocking'),
      cautionShown('sighash', 'blocking'),
      decided('cancel', '3_to_10s'),
    ],
    note: 'A signature normally says which coins go in and where the bitcoin goes out. SIGHASH_NONE, or NONE|ANYONECANPAY, covers only your coin and none of the outputs, so whoever holds the signature can write any destination: a blank cheque. For your own coins Leather blocks it, with no Sign, and still shows what was asked so the stop is explainable. Today Leather refuses it unless the site lists it in allowedSighash; since the site writes that list itself, the proposal is to block for your own inputs even when it is listed.',
    render() {
      return <SighashNonePsbt />;
    },
  },
];
