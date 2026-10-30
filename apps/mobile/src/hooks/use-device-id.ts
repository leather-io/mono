import { useEffect, useState } from 'react';

import { getDeviceId } from '@/utils/get-device-id';

type DeviceId = ReturnType<typeof getDeviceId>;

export function useDeviceId() {
  const [value, setValue] = useState<Awaited<DeviceId>>(null);

  useEffect(() => {
    async function loadDeviceId() {
      try {
        setValue(await getDeviceId());
      } catch {
        setValue(null);
      }
    }
    void loadDeviceId();
  }, []);

  return value;
}
