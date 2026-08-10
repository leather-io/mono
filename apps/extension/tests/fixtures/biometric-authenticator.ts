import type { CDPSession, Page } from '@playwright/test';

export interface VirtualAuthenticator {
  authenticatorId: string;
  client: CDPSession;
}

export async function attachPrfVirtualAuthenticator(page: Page): Promise<VirtualAuthenticator> {
  const client = await page.context().newCDPSession(page);
  await client.send('WebAuthn.enable');
  const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      automaticPresenceSimulation: true,
      ctap2Version: 'ctap2_1',
      hasPrf: true,
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      protocol: 'ctap2',
      transport: 'internal',
    },
  });
  return { authenticatorId, client };
}

export async function detachVirtualAuthenticator({
  authenticatorId,
  client,
}: VirtualAuthenticator) {
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
  await client.send('WebAuthn.disable');
  await client.detach();
}

export async function removeVirtualAuthenticatorCredentials({
  authenticatorId,
  client,
}: VirtualAuthenticator) {
  const { credentials } = await client.send('WebAuthn.getCredentials', { authenticatorId });
  await Promise.all(
    credentials.map(credential =>
      client.send('WebAuthn.removeCredential', {
        authenticatorId,
        credentialId: credential.credentialId,
      })
    )
  );
}
