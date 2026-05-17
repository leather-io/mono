import { useCallback, useState } from 'react';

import { useFormikContext } from 'formik';

import { FormErrorMessages } from '@shared/error-messages';
import { logger } from '@shared/logger';
import { BitcoinSendFormValues } from '@shared/models/form.model';

const BNRP_API_BASE = 'https://api.bnrp.name/v1';

// TLDs supported by BNRP — https://bnrp.name
export const BNRP_SUPPORTED_TLDS = [
  '.btc',
  '.sats',
  '.x',
  '.ord',
  '.xbt',
  '.gm',
  '.unisat',
  '.sat',
] as const;

export function isBnrpName(value: string): boolean {
  const lower = value.toLowerCase();
  return BNRP_SUPPORTED_TLDS.some(tld => lower.endsWith(tld));
}

interface BnrpResolveResponse {
  name: string;
  owner: string;
  addresses: {
    btc_taproot: string | null;
    btc_segwit: string | null;
    btc_p2sh: string | null;
    btc_legacy: string | null;
  };
}

async function resolveBnrpName(name: string): Promise<string | null> {
  const url = `${BNRP_API_BASE}/resolve/${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data: BnrpResolveResponse = await res.json();
  // Prefer taproot; fall back to segwit then p2sh then legacy
  return (
    data.addresses.btc_taproot ??
    data.addresses.btc_segwit ??
    data.addresses.btc_p2sh ??
    data.addresses.btc_legacy ??
    null
  );
}

// Handles validating the BNRP name lookup
export function useRecipientBnrpName() {
  const { setFieldError, setFieldValue, values } =
    useFormikContext<BitcoinSendFormValues>();
  const [bnrpAddress, setBnrpAddress] = useState('');

  const getBnrpAddressAndValidate = useCallback(async () => {
    setBnrpAddress('');
    if (!values.recipientBnrpName) return;

    try {
      const address = await resolveBnrpName(values.recipientBnrpName);

      if (address) {
        setBnrpAddress(address);
        setFieldError('recipient', undefined);
        await setFieldValue('recipient', address);
      } else {
        setFieldError('recipientBnrpName', FormErrorMessages.BnsAddressNotFound);
      }
    } catch (e) {
      setFieldError('recipientBnrpName', FormErrorMessages.BnsAddressNotFound);
      logger.error('Error fetching BNRP address', e);
    }
  }, [setFieldError, setFieldValue, values.recipientBnrpName]);

  return { bnrpAddress, getBnrpAddressAndValidate, setBnrpAddress };
}
