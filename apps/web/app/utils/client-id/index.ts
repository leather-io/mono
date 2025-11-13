import * as Sentry from '@sentry/react-router';

const clientIdV1Key = 'client-id-v1';

function generateClientId() {
  return crypto.randomUUID();
}

function setClientId(id: string) {
  try {
    localStorage.setItem(clientIdV1Key, id);
  } catch (e) {
    Sentry.captureException(e, {
      level: 'warning',
      extra: {
        key: clientIdV1Key,
      },
    });
  }
}

export function getClientId() {
  let id: string | null = null;
  try {
    id = localStorage.getItem(clientIdV1Key);
  } catch (e) {
    Sentry.captureException(e, {
      level: 'warning',
      extra: {
        key: clientIdV1Key,
      },
    });
  }

  if (id) return id;

  id = generateClientId();
  setClientId(id);

  return id;
}
