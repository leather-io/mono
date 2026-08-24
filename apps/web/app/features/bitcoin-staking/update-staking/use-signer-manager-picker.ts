import { useState } from 'react';

import {
  BitcoinStakingPool,
  StakingPoolSlug,
  bitcoinStakingPoolList,
  getPoolBySignerManager,
  getPrimarySignerManagerContract,
  getStakingPoolFromSlug,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';

import { parseByosmContractInput } from '../byosm/byosm-contract-schema';
import {
  ByosmSignerManagerState,
  useSignerManagerContractInput,
} from '../byosm/use-byosm-signer-manager';
import { currentCustomRowId, customRowId } from './update-staking-summary';

interface SignerManagerTarget {
  contractId: string;
  pool: BitcoinStakingPool | null;
}

interface UseSignerManagerPickerArgs {
  currentContractId: string;
  currentPool: BitcoinStakingPool | null;
  initialTargetSlug: StakingPoolSlug | null;
}

interface UseSignerManagerPickerResult {
  selectedRowId: string;
  selectRow(rowId: string): void;
  customInput: string;
  onCustomInputChange(value: string): void;
  customState: ByosmSignerManagerState;
  validateCustom(): void;
  isCustomSelected: boolean;
  target: SignerManagerTarget | null;
  isSwitching: boolean;
  termsAccepted: boolean;
  toggleTermsAccepted(): void;
}

export function useSignerManagerPicker({
  currentContractId,
  currentPool,
  initialTargetSlug,
}: UseSignerManagerPickerArgs): UseSignerManagerPickerResult {
  const currentRowId = currentPool ? currentPool.providerId : currentCustomRowId;

  const [selectedRowId, setSelectedRowId] = useState(() =>
    initialTargetSlug ? getStakingPoolFromSlug(initialTargetSlug).providerId : currentRowId
  );
  const [customInput, setCustomInput] = useState('');
  const [submittedCustomInput, setSubmittedCustomInput] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isCustomSelected = selectedRowId === customRowId;
  const customState = useSignerManagerContractInput(isCustomSelected ? submittedCustomInput : null);

  function selectRow(rowId: string) {
    setSelectedRowId(rowId);
    setTermsAccepted(false);
    if (rowId !== customRowId) {
      setCustomInput('');
      setSubmittedCustomInput(null);
    }
  }

  function onCustomInputChange(value: string) {
    setCustomInput(value);
    setSubmittedCustomInput(null);
    setTermsAccepted(false);
  }

  function validateCustom() {
    if (customState.status === 'check-failed' && submittedCustomInput === customInput) {
      customState.retry();
      return;
    }

    const parsed = parseByosmContractInput(customInput, pox5NetworkConfig.contractNetworkMode);
    if (parsed.ok) {
      if (parsed.contractId === currentContractId) {
        selectRow(currentRowId);
        return;
      }
      const listedPool = getPoolBySignerManager(parsed.contractId);
      if (listedPool) {
        selectRow(listedPool.providerId);
        return;
      }
    }

    setSubmittedCustomInput(customInput);
  }

  const target = ((): SignerManagerTarget | null => {
    if (selectedRowId === currentRowId) return null;
    if (isCustomSelected) {
      if (customState.status !== 'valid') return null;
      return { contractId: customState.contractId, pool: null };
    }
    const selectedPool = bitcoinStakingPoolList.find(pool => pool.providerId === selectedRowId);
    if (!selectedPool) return null;
    const contractId = getPrimarySignerManagerContract(
      selectedPool.providerId,
      pox5NetworkConfig.contractNetworkMode
    );
    if (!contractId) return null;
    return { contractId, pool: selectedPool };
  })();

  return {
    selectedRowId,
    selectRow,
    customInput,
    onCustomInputChange,
    customState,
    validateCustom,
    isCustomSelected,
    target,
    isSwitching: target !== null,
    termsAccepted,
    toggleTermsAccepted() {
      setTermsAccepted(accepted => !accepted);
    },
  };
}
