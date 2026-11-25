import { type ReactNode, createElement } from 'react';

import { type RecipientActivity } from '@/features/send/components/recipient/recipient.types';
import { useRecipientSuggestions } from '@/features/send/components/recipient/use-recipient-suggestions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { stxAsset } from '@leather.io/constants';

vi.mock('@leather.io/ui/native', () => ({
  useDebouncedValue<T>(value: T) {
    return value;
  },
}));

vi.mock('@/features/send/components/recipient/recipient.utils', async importOriginal => ({
  ...(await importOriginal<object>()),
  getLookupHelperByChain: () => vi.fn(),
}));

vi.mock('@/features/send/components/recipient/use-account-helpers', () => ({
  useAccountHelpers: () => ({
    findAccountByAddress: () => null,
    getAddressByAccount: () => null,
  }),
}));

vi.mock('@/store/accounts/accounts.read', () => ({
  useAccounts: () => ({ list: [] }),
}));

const currentAccount = { fingerprint: 'abc', accountIndex: 0 };
const recentReceiver = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const recentActivity: RecipientActivity[] = [
  { txid: '0x1', timestamp: 1_700_000_000, receivers: [recentReceiver] },
];

interface HookProps {
  activity: RecipientActivity[];
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe(useRecipientSuggestions.name, () => {
  it('shows recents once the activity lookup resolves after the sheet mounted', async () => {
    const { result, rerender } = renderHook<ReturnType<typeof useRecipientSuggestions>, HookProps>(
      ({ activity }) =>
        useRecipientSuggestions({
          searchTerm: '',
          activity,
          recipientSchema: z.string(),
          asset: stxAsset,
          currentAccount,
        }),
      { initialProps: { activity: [] }, wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.find(section => section.id === 'recents')).toBeUndefined();

    rerender({ activity: recentActivity });

    await waitFor(() =>
      expect(result.current.data?.find(section => section.id === 'recents')).toBeDefined()
    );
  });
});
