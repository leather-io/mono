import { shouldRefuseSignInMessageSigning } from './sign-in-message-veto';

const origin = 'https://app.leather.io';

function signInMessage(domain: string) {
  return `Sign in to Leather\nDomain: ${domain}\nApplication: multisig\nNetwork: mainnet\nIssued: 1780651887`;
}

describe(shouldRefuseSignInMessageSigning.name, () => {
  it('allows a message that is not a sign-in message', () => {
    expect(shouldRefuseSignInMessageSigning('gm, sign this', origin)).toBe(false);
  });

  it('allows a message that merely contains the reserved line mid-text', () => {
    expect(shouldRefuseSignInMessageSigning(`prefix\n${signInMessage(origin)}`, origin)).toBe(
      false
    );
  });

  it('allows a sign-in message whose domain matches the requesting origin', () => {
    expect(shouldRefuseSignInMessageSigning(signInMessage(origin), origin)).toBe(false);
  });

  it('refuses a sign-in message naming a different origin', () => {
    expect(shouldRefuseSignInMessageSigning(signInMessage(origin), 'https://evil.example')).toBe(
      true
    );
  });

  it('refuses a sign-in message with no Domain line', () => {
    expect(
      shouldRefuseSignInMessageSigning('Sign in to Leather\nNetwork: mainnet\nIssued: 1', origin)
    ).toBe(true);
  });

  it('refuses a CRLF sign-in message naming a different origin', () => {
    const crlfMessage = signInMessage(origin).replace(/\n/g, '\r\n');
    expect(shouldRefuseSignInMessageSigning(crlfMessage, 'https://evil.example')).toBe(true);
  });

  it('allows a CRLF sign-in message whose domain matches the requesting origin', () => {
    const crlfMessage = signInMessage(origin).replace(/\n/g, '\r\n');
    expect(shouldRefuseSignInMessageSigning(crlfMessage, origin)).toBe(false);
  });

  it('refuses when the requesting origin is unknown', () => {
    expect(shouldRefuseSignInMessageSigning(signInMessage(origin), undefined)).toBe(true);
  });

  it('compares the origin byte-for-byte, scheme and port included', () => {
    expect(
      shouldRefuseSignInMessageSigning(
        signInMessage('http://localhost:4000'),
        'http://localhost:4001'
      )
    ).toBe(true);
    expect(
      shouldRefuseSignInMessageSigning(
        signInMessage('http://localhost:4000'),
        'http://localhost:4000'
      )
    ).toBe(false);
  });
});
