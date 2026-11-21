import { renderToString } from 'react-dom/server';

import { type Money, createMarketData, createMarketPair } from '@leather.io/models';
import type * as LeatherUi from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { TransactionActionsWithSpend } from './transaction-actions-with-spend';

const feeEditorContextMock = vi.fn<() => unknown>();

vi.mock('@app/features/fee-editor/fee-editor.context', () => ({
  useFeeEditorContext: () => feeEditorContextMock(),
}));

vi.mock('../stacks/stacks-rpc-transaction-request.context', () => ({
  useStacksRpcTransactionRequestContext: () => ({ status: 'idle' }),
}));

vi.mock('@leather.io/ui', async importOriginal => {
  const original = await importOriginal<typeof LeatherUi>();
  return {
    ...original,
    Approver: {
      ...original.Approver,
      Actions({ actions, children }: { actions: React.ReactNode[]; children: React.ReactNode }) {
        return (
          <div>
            {children}
            {actions}
          </div>
        );
      },
    },
  };
});

const insufficientBalanceText = 'Available balance insufficient';
const stxMarketData = createMarketData(createMarketPair('STX', 'USD'), createMoney(50, 'USD'));
const tokenMarketData = createMarketData(createMarketPair('LEO', 'USD'), createMoney(200, 'USD'));
const tokenAmount = createMoney(100000000, 'LEO', 6);

function mockFeeEditor(availableBalance: Money, fee = createMoney(3_000_000, 'STX')) {
  feeEditorContextMock.mockReturnValue({
    availableBalance,
    marketData: stxMarketData,
    selectedFee: { priority: 'standard', txFee: fee, time: '' },
  });
}

interface RenderActionsArgs {
  isSponsored?: boolean;
  txAmount?: Money;
  tokenAmountInQuote?: Money;
}
function renderActions({
  isSponsored = false,
  txAmount = createMoney(0, 'STX'),
  tokenAmountInQuote,
}: RenderActionsArgs = {}) {
  return renderToString(
    <TransactionActionsWithSpend
      isLoading={false}
      isSponsored={isSponsored}
      txAmount={txAmount}
      tokenAmountInQuote={tokenAmountInQuote}
      onApprove={vi.fn()}
    />
  );
}

describe(TransactionActionsWithSpend.name, () => {
  test('prices a SIP-10 transfer with the token market data plus the fee', () => {
    mockFeeEditor(createMoney(10_000_000, 'STX'));

    const html = renderActions({
      tokenAmountInQuote: baseCurrencyAmountInQuote(tokenAmount, tokenMarketData),
    });

    expect(html).toContain('$201.50');
    expect(html).toContain('Approve');
    expect(html).not.toContain(insufficientBalanceText);
  });

  test('shows only the fee for an unpriced SIP-10 transfer', () => {
    mockFeeEditor(createMoney(10_000_000, 'STX'));

    const html = renderActions();

    expect(html).toContain('$1.50');
    expect(html).not.toContain(insufficientBalanceText);
  });

  test('ignores a token amount quoted in another currency', () => {
    mockFeeEditor(createMoney(10_000_000, 'STX'));

    const html = renderActions({ tokenAmountInQuote: createMoney(20000, 'EUR') });

    expect(html).toContain('$1.50');
    expect(html).not.toContain(insufficientBalanceText);
  });

  test('shows the error when the STX amount exceeds the available balance', () => {
    mockFeeEditor(createMoney(1_000_000, 'STX'));

    const html = renderActions({ txAmount: createMoney(1_000_000_000, 'STX') });

    expect(html).toContain(insufficientBalanceText);
  });

  test('shows the error when the fee exceeds the available balance', () => {
    mockFeeEditor(createMoney(1000, 'STX'));

    const html = renderActions();

    expect(html).toContain(insufficientBalanceText);
  });

  test('does not show the error for a sponsored request', () => {
    mockFeeEditor(createMoney(0, 'STX'));

    const html = renderActions({ isSponsored: true, txAmount: createMoney(1_000_000, 'STX') });

    expect(html).not.toContain(insufficientBalanceText);
  });
});
