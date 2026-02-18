import { PlusIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useLocation, useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

import { CollectibleItemLayout } from '../../../components/collectibles/collectible-item.layout';

export function AddCollectible() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  return (
    <CollectibleItemLayout
      onClickLayout={() => {
        analytics.track('select_add_new_collectible');
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(location.pathname));
        void navigate(`${RouteUrls.Home}${RouteUrls.ReceiveCollectible}`);
      }}
      showBorder
      subtitle="Collectible"
      title="Add new"
    >
      <PlusIcon height={36} width={36} />
    </CollectibleItemLayout>
  );
}
