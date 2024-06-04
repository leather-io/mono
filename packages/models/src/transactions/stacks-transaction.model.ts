import type React from 'react';

export interface StxTransfer {
  amount: string;
  sender?: string;
  recipient?: string;
}

export interface FtTransfer {
  asset_identifier: string;
  amount: string;
  sender?: string;
  recipient?: string;
}

export interface TxTransferDetails {
  caption: string;
  icon: React.ReactNode;
  link: string;
  title: string;
  value: number | string | null;
}
