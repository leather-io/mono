import { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

import { SignMessageMissingAccountError } from './sign-message-missing-account-error';

vi.mock('@shared/messaging/send-message-to-originating-frame', () => ({
  sendMessageToOriginatingFrame: vi.fn(),
}));

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: vi.fn() },
}));

vi.mock('@app/common/hooks/use-default-request-search-params', () => ({
  useDefaultRequestParams: () => ({ frameId: 1, tabId: 2, origin: 'https://app.example.com' }),
}));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: new URLSearchParams('requestId=test-request-id'),
}));

vi.mock('@app/common/utils', () => ({
  capitalize: (val: string) => val.charAt(0).toUpperCase() + val.slice(1),
}));

vi.mock('@app/components/generic-error/generic-error', () => ({
  GenericError: ({
    title,
    body,
    helpTextList,
  }: {
    title: string;
    body: string;
    helpTextList: ReactNode[];
  }) => (
    <div>
      <h1>{title}</h1>
      <h2>{body}</h2>
      <ul>{helpTextList}</ul>
    </div>
  ),
  GenericErrorListItem: ({ text }: { text: ReactNode }) => <li>{text}</li>,
}));

describe(SignMessageMissingAccountError.name, () => {
  test('renders the bitcoin warning with connect instructions', () => {
    const html = renderToString(<SignMessageMissingAccountError chain="bitcoin" />);

    expect(html).toContain('Bitcoin account not found');
    expect(html).toContain('sign a message with your Bitcoin account');
    expect(html).toContain('Connect Bitcoin');
    expect(html).toContain('Connect your Ledger device with the Bitcoin app open');
  });

  test('renders the stacks warning with connect instructions', () => {
    const html = renderToString(<SignMessageMissingAccountError chain="stacks" />);

    expect(html).toContain('Stacks account not found');
    expect(html).toContain('sign a message with your Stacks account');
    expect(html).toContain('Connect Stacks');
    expect(html).toContain('Connect your Ledger device with the Stacks app open');
  });
});
