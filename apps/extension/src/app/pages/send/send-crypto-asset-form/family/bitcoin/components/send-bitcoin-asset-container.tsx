import { createContext, useContext, useState } from 'react';

import type { BtcFeeType } from '@leather.io/models';

import { Outlet } from '@app/routes/compat';

interface SendBitcoinAssetContextState {
  selectedFeeType: BtcFeeType | null;
  setSelectedFeeType(value: BtcFeeType | null): void;
}

const sendBitcoinAssetContext = createContext<SendBitcoinAssetContextState | null>(null);

export function useSendBitcoinAssetContextState() {
  const context = useContext(sendBitcoinAssetContext);
  if (!context)
    throw new Error(
      'useSendBitcoinAssetContextState must be used within SendBitcoinAssetContainer'
    );
  return { ...context };
}

export function SendBitcoinAssetContainer() {
  const [selectedFeeType, setSelectedFeeType] = useState<BtcFeeType | null>(null);
  return (
    <sendBitcoinAssetContext.Provider value={{ selectedFeeType, setSelectedFeeType }}>
      <Outlet />
    </sendBitcoinAssetContext.Provider>
  );
}
