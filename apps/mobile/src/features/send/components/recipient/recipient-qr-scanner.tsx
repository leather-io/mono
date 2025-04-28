import { ParserResult, QrScanner } from '@/features/qr-scanner/qr-scanner';
import { t } from '@lingui/macro';

import { bip21, isValidBitcoinAddress } from '@leather.io/bitcoin';
import { SupportedBlockchains } from '@leather.io/models';
import { isValidStacksAddress } from '@leather.io/stacks';

interface RecipientQrScannerProps {
  onScanned: (data: { address: string; chain: SupportedBlockchains }) => void;
  onClose: () => void;
}

export function RecipientQrScanner({ onClose, onScanned }: RecipientQrScannerProps) {
  return <QrScanner parse={parse} onClose={onClose} onScanned={onScanned} />;
}

function parse(data: string): ParserResult<{ address: string; chain: SupportedBlockchains }> {
  if (isValidBitcoinAddress(data)) {
    return createSuccessResult('bitcoin', data);
  }

  if (isValidStacksAddress(data)) {
    return createSuccessResult('stacks', data);
  }

  const bip21Result = bip21.decode(data);
  if (bip21Result.success && isValidBitcoinAddress(bip21Result.data.address)) {
    return createSuccessResult('bitcoin', bip21Result.data.address);
  }

  return {
    success: false,
    error: t({
      id: 'send-form.recipient.unsupported_qr',
      message: 'Scan a Bitcoin or Stacks address',
    }),
  };
}

function createSuccessResult(chain: SupportedBlockchains, address: string) {
  return {
    success: true,
    data: { chain, address },
  } as const;
}
