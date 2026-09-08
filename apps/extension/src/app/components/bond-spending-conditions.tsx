import { Stack, styled } from 'leather-styles/jsx';

import type { BondVaultLeaf } from '@leather.io/bitcoin';

export interface BondSpendingDetails {
  unlockHeight: number;
  hash: string;
  counterpartyKey: string;
  vaultKind: BondVaultLeaf['kind'];
  vaultThreshold: number;
  vaultKeyExpressions: string[];
}

const ownerKeyRequirement = 'the owner key';

export function formatVaultRequirement({
  vaultKind,
  vaultThreshold,
  vaultKeyExpressions,
}: BondSpendingDetails) {
  if (vaultKind === 'pk') return ownerKeyRequirement;
  return `${vaultThreshold} of ${vaultKeyExpressions.length} vault co-signers`;
}

interface BondSpendingConditionsProps {
  details: BondSpendingDetails;
}

export function BondSpendingConditions({ details }: BondSpendingConditionsProps) {
  const requirement = formatVaultRequirement(details);
  const ownerKey = details.vaultKind === 'pk' ? details.vaultKeyExpressions[0] : null;

  return (
    <Stack gap="space.04">
      <Stack gap="space.01">
        <styled.span textStyle="label.02" data-testid="bond-unlock-height">
          From block {details.unlockHeight}
        </styled.span>
        <styled.span
          textStyle="caption.01"
          color="ink.text-subdued"
          data-testid="bond-vault-policy"
        >
          Requires {requirement}
        </styled.span>
        {ownerKey ? (
          <>
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              Owner key
            </styled.span>
            <styled.code textStyle="caption.01" wordBreak="break-all" data-testid="bond-owner-key">
              {ownerKey}
            </styled.code>
          </>
        ) : null}
      </Stack>
      <Stack gap="space.01">
        <styled.span textStyle="label.02">Before block {details.unlockHeight}</styled.span>
        <styled.span
          textStyle="caption.01"
          color="ink.text-subdued"
          data-testid="bond-early-exit-policy"
        >
          Requires {requirement}, plus a signature from the counterparty key and the secret matching
          the SHA-256 hash
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Counterparty key
        </styled.span>
        <styled.code
          textStyle="caption.01"
          wordBreak="break-all"
          data-testid="bond-counterparty-key"
        >
          {details.counterpartyKey}
        </styled.code>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          SHA-256 hash
        </styled.span>
        <styled.code textStyle="caption.01" wordBreak="break-all" data-testid="bond-hash">
          {details.hash}
        </styled.code>
      </Stack>
    </Stack>
  );
}
