import { useEffect, useState } from 'react';

import { getDeviceId } from '@/utils/get-device-id';

type DeviceId = ReturnType<typeof getDeviceId>;

export function useDeviceId() {
  const [value, setValue] = useState<Awaited<DeviceId>>(null);

  useEffect(() => {
    getDeviceId()
      .then(id => setValue(id))
      .catch(() => setValue(null));
  }, []);

  return value;
}
