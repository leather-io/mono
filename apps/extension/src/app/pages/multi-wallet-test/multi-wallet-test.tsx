import { useState } from 'react';
import { Outlet } from 'react-router';

import { DeveloperUtilitiesSheet } from '@app/features/developer-utilities/developer-utilities-sheet';

export function MultiWalletTest() {
  const [isShowingSheet, setIsShowingSheet] = useState(false);

  return (
    <>
      <Outlet />

      <DeveloperUtilitiesSheet
        isShowing={isShowingSheet}
        onClose={() => setIsShowingSheet(false)}
      />
    </>
  );
}
