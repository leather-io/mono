import {
  type BitcoinFeeRatesData,
  useBitcoinFeeRates,
} from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';

interface SendInscriptionLoaderProps {
  children(data: { feeRates: BitcoinFeeRatesData }): React.JSX.Element;
}
export function SendInscriptionLoader({ children }: SendInscriptionLoaderProps) {
  const { data: feeRates } = useBitcoinFeeRates();
  if (!feeRates) return null;
  return children({ feeRates });
}
