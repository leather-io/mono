import { useFeeEditorContext } from '../fee-editor.context';
import { CustomFeeItem } from './custom-fee-item';
import { FeeItem } from './fee-item';

export function DefaultFeesList() {
  const { customFee, fees, getCustomFee } = useFeeEditorContext();
  if (!fees) return null;
  const customFeeValue = Number(customFee);
  return (
    <>
      <FeeItem fee={fees.slow} />
      <FeeItem fee={fees.standard} />
      <FeeItem fee={fees.fast} />
      <CustomFeeItem fee={customFeeValue > 0 ? getCustomFee(customFeeValue) : fees.custom} />
    </>
  );
}
