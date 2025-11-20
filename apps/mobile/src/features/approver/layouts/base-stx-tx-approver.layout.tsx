import { useEffect, useRef, useState } from 'react';

import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { OutcomeAddressesCard } from '@/features/approver/components/outcome-addresses-card';
import { StacksOutcome } from '@/features/approver/components/stacks-outcome';
import { ContractCallArgsSection } from '@/features/approver/contract-call-args.section';
import { ContractCallSummarySection } from '@/features/approver/contract-call-summary.section';
import { ContractDeployCodeSection } from '@/features/approver/contract-deploy-code.section';
import { ContractDeploySummarySection } from '@/features/approver/contract-deploy-summary.section';
import { MemoSection } from '@/features/approver/memo.section';
import { NonceSection } from '@/features/approver/nonce.section';
import { StacksFeesSection } from '@/features/approver/stacks-fees.section';
import {
  TxOptions,
  assertTokenTransferPayload,
  getTotalSpendMoney,
  getTxRecipient,
  isContractCall,
  isContractDeploy,
  isTokenTransfer,
} from '@/features/approver/utils';
import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';
import {
  PostConditionMode,
  deserializeTransaction,
  isTokenTransferPayload,
} from '@stacks/transactions';
import * as Clipboard from 'expo-clipboard';

import { stxAsset } from '@leather.io/constants';
import { makeAccountIdentifer } from '@leather.io/crypto';
import { makeActivityLink } from '@leather.io/features';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { Approver, SentIcon, SheetInstance } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { AllowModeWarningSheet } from '../components/allow-mode-warning-sheet/allow-mode-warning-sheet';
import { ApproverButtons } from '../components/approver-buttons';
import { AllowModePostConditionWarning } from '../components/post-conditions/post-conditions-warning';
import { SipRecipient } from '../components/sip10-recipient';
import { StxStatusRow } from '../components/status-row/stx-status-row';
import { ContractCallPostConditionsSection } from '../contract-call-post-conditions.section';
import { useStxTransactionUpdatesHandler } from '../stx/hooks';

interface BaseStxTxApproverLayoutProps {
  onApprove(): Promise<string>;
  onCloseApprover(): void;
  onBack(): void;
  accountId: string | null;
  accounts: Account[];
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
  origin?: string;
  onBack(): void;
}

export function BaseStxTxApproverLayout({
  onApprove,
  onCloseApprover,
  accountId,
  accounts,
  txHex,
  setTxHex,
  txOptions,
  origin,
  onBack,
}: BaseStxTxApproverLayoutProps) {
  const approverWarningSheetRef = useRef<SheetInstance>(null);
  const tx = deserializeTransaction(txHex);
  const { changeFeeToastHandler, changeMemoToastHandler, changeNonceToastHandler } =
    useStxTransactionUpdatesHandler();
  const [broadcastedTxid, setBroadcastedTxid] = useState<null | string>(null);
  const network = useCurrentNetworkState();
  const { openUrl } = useOpenUrl();

  useEffect(() => {
    if (tx.postConditionMode === PostConditionMode.Allow) {
      approverWarningSheetRef.current?.present();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeMemo = changeMemoToastHandler(async (memo: string) => {
    assertTokenTransferPayload(tx.payload);
    const newTx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      amount: createMoney(tx.payload.amount, 'STX'),
      fee: createMoney(tx.auth.spendingCondition.fee, 'STX'),
      nonce: Number(tx.auth.spendingCondition.nonce),
      recipient: tx.payload.recipient,
      memo,
      ...txOptions,
    });
    const newTxHex = newTx.serialize();
    setTxHex(newTxHex);
  });

  const onChangeFee = changeFeeToastHandler((fee: number) => {
    tx.setFee(fee);
    const newTxHex = tx.serialize();
    setTxHex(newTxHex);
  });

  const onChangeNonce = changeNonceToastHandler((nonce: string) => {
    tx.setNonce(Number(nonce));
    const newTxHex = tx.serialize();
    setTxHex(newTxHex);
  });

  const isModifyingDisabled = !!broadcastedTxid;

  return (
    <>
      <Approver requester={origin}>
        <Approver.Container>
          <Approver.Header title={t`Sign Transaction`} />
          {isContractCall(tx.payload) && <AllowModePostConditionWarning txHex={txHex} />}
          {broadcastedTxid && <StxStatusRow txid={broadcastedTxid} />}

          <Approver.Section>
            <ApproverAccountCard
              accounts={accounts.filter(
                acc => makeAccountIdentifer(acc.fingerprint, acc.accountIndex) === accountId
              )}
              displayPreference="stacks"
            />
          </Approver.Section>
          {isTokenTransferPayload(tx.payload) && (
            <Approver.Overview>
              <Approver.Section mb="-3">
                <Approver.Subheader icon={<SentIcon variant="small" />}>
                  {t`You’ll send`}
                </Approver.Subheader>

                <StacksOutcome
                  amount={getTotalSpendMoney(tx.payload, tx.auth.spendingCondition.fee)}
                />
              </Approver.Section>

              <Approver.Section>
                <Approver.Subheader>{t`To address`}</Approver.Subheader>

                <OutcomeAddressesCard addresses={[getTxRecipient(tx.payload)]} />
              </Approver.Section>
            </Approver.Overview>
          )}
          {isContractCall(tx.payload) && accountId && (
            <Approver.Overview>
              <ContractCallPostConditionsSection txHex={txHex} origin={origin} />

              <SipRecipient txHex={txHex} />
            </Approver.Overview>
          )}

          {isContractCall(tx.payload) && <ContractCallSummarySection txHex={txHex} />}
          {isContractDeploy(tx.payload) && <ContractDeploySummarySection txHex={txHex} />}
          <StacksFeesSection
            disabled={isModifyingDisabled}
            txHex={txHex}
            onChangeFee={onChangeFee}
          />
          {isTokenTransfer(tx.payload) && (
            <MemoSection memo={tx.payload.memo.content} disabled onChangeMemo={onChangeMemo} />
          )}
          <Approver.Advanced
            titleClosed={t`Show advanced options`}
            titleOpened={t`Hide advanced options`}
          >
            {isContractCall(tx.payload) && <ContractCallArgsSection txHex={txHex} />}
            {isContractDeploy(tx.payload) && <ContractDeployCodeSection txHex={txHex} />}
            <NonceSection
              nonce={tx.auth.spendingCondition.nonce.toString()}
              onChangeNonce={onChangeNonce}
              disabled={isModifyingDisabled}
            />
          </Approver.Advanced>
        </Approver.Container>
        <Approver.Footer>
          <ApproverButtons
            onBack={onBack}
            onClose={onCloseApprover}
            onApprove={async () => {
              const txid = await onApprove();
              setBroadcastedTxid(txid);
            }}
            onCopy={() => {
              if (!broadcastedTxid) return;
              void Clipboard.setStringAsync(broadcastedTxid);
            }}
            onViewDetails={() => {
              if (!broadcastedTxid) return;

              const activityLink = makeActivityLink({
                txid: broadcastedTxid,
                networkPreference: network,
                asset: stxAsset,
              });

              if (!activityLink) return;

              openUrl(activityLink);
              onCloseApprover();
            }}
          />
        </Approver.Footer>
      </Approver>
      <AllowModeWarningSheet ref={approverWarningSheetRef} onDismiss={onCloseApprover} />
    </>
  );
}
