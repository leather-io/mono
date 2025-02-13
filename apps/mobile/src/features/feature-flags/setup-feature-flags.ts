import { getDeviceId } from '@/utils/get-device-id';

import { featureFlagClient } from './feature-flag';

export async function setupFeatureFlags() {
  const deviceId = await getDeviceId();
  if (!deviceId) {
    // TODO: handle this error properly
    throw new Error('No device id detected');
  }
  featureFlagClient.identify({ kind: 'user', key: deviceId }).catch((e: any) => {
    // TODO: analytics?
    // eslint-disable-next-line no-console
    console.log(e);
  });
}
