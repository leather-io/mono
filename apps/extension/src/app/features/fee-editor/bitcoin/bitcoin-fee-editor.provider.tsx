import type { MarketData, Money, OwnedUtxo } from '@leather.io/models';
import type { AccountRequest } from '@leather.io/services';

import type { TransferRecipient } from '@shared/models/form.model';

import type { HasChildren } from '@app/common/has-children';

import { FeeEditorProvider } from '../fee-editor.provider';
import { BitcoinFeesLoader } from './bitcoin-fees-loader';

interface BitcoinFeeEditorProviderProps extends HasChildren {
  account: AccountRequest;
  availableBalance: Money;
  isSendingMax?: boolean;
  loadingFallback: React.ReactNode;
  marketData: MarketData;
  onGoBack(): void;
  recipients: TransferRecipient[];
  utxos: OwnedUtxo[];
}
export function BitcoinFeeEditorProvider({
  account,
  availableBalance,
  children,
  isSendingMax,
  loadingFallback,
  marketData,
  onGoBack,
  recipients,
  utxos,
}: BitcoinFeeEditorProviderProps) {
  return (
    <BitcoinFeesLoader
      account={account}
      isSendingMax={isSendingMax}
      loadingFallback={loadingFallback}
      recipients={recipients}
      utxos={utxos}
    >
      {({ fees, feesError, isLoading, getCustomFee }) => {
        return (
          <FeeEditorProvider
            availableBalance={availableBalance}
            fees={fees}
            feesError={feesError}
            feeType="fee-rate"
            getCustomFee={getCustomFee}
            isLoadingFees={isLoading}
            isSponsored={false}
            marketData={marketData}
            onGoBack={onGoBack}
          >
            {children}
          </FeeEditorProvider>
        );
      }}
    </BitcoinFeesLoader>
  );
}
