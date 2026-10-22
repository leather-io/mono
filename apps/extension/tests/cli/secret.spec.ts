import { createRedactor, redactedSecret } from './secret';

const phrase =
  'abandon ability able about above absent absorb abstract absurd abuse access accident';

describe('createRedactor', () => {
  test('replaces every occurrence of the phrase', () => {
    const redact = createRedactor([phrase]);
    expect(redact(`seed: ${phrase} and again ${phrase}`)).toBe(
      `seed: ${redactedSecret} and again ${redactedSecret}`
    );
  });

  test('matches the phrase across line breaks and extra spaces', () => {
    const redact = createRedactor([phrase]);
    expect(redact(phrase.replace(' able ', '\n  able   '))).toBe(redactedSecret);
  });

  test('leaves text alone without secrets or with blank secrets', () => {
    expect(createRedactor([])('nothing here')).toBe('nothing here');
    expect(createRedactor(['   '])('nothing here')).toBe('nothing here');
  });

  test('does not redact a single word of the phrase', () => {
    expect(createRedactor([phrase])('abandon all hope')).toBe('abandon all hope');
  });
});
