import { stxSignMessage } from './stx-sign-message';

describe('`stx_signMessage` schema', () => {
  test('that it defaults to utf8', () => {
    const result = stxSignMessage.params.safeParse({
      message: 'hello world',
    });
    expect(result.success).toBe(true);
  });

  test('that it accepts utf8 as messageType', () => {
    const result = stxSignMessage.params.safeParse({
      message: 'hello world',
      messageType: 'utf8',
    });
    expect(result.success).toBe(true);
  });

  test('that it accepts structuctured as messageType', () => {
    const result = stxSignMessage.params.safeParse({
      message: 'hello world',
      domain: 'deadbeef',
      messageType: 'structured',
    });
    expect(result.success).toBe(true);
  });
});
