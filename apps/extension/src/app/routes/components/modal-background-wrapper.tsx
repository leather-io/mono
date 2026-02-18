import { useSelector } from 'react-redux';

import { Outlet } from '@app/routes/compat';
import type { RootState } from '@app/store';

interface ModalBackgroundWrapperProps {
  children: React.ReactNode;
}
export function ModalBackgroundWrapper({ children }: ModalBackgroundWrapperProps) {
  const backgroundPathname = useSelector(
    (state: RootState) => state.navigation.modal.backgroundLocationPathname
  );

  return (
    <>
      {children}
      {backgroundPathname && <Outlet />}
    </>
  );
}
