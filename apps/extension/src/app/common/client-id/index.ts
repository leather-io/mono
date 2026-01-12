import * as Sentry from '@sentry/react';
import { v4 as uuidv4 } from 'uuid';

const clientIdV1Key = 'client-id-v1';

function generateClientId() {
  return uuidv4();
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
  // Dev override: allows stable LD client ID across reinstalls
  // Set LD_CLIENT_ID in .env (e.g., LD_CLIENT_ID=dev-your-name)
  if (process.env.LD_CLIENT_ID) {
    return process.env.LD_CLIENT_ID;
  }

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
