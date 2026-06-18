import { addReplayActionListener } from '@shared/messages';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useAppDispatch } from '@app/store';
import { isReplayableAction } from '@app/store/replay-actions';

export function useOnReplayAction() {
  const dispatch = useAppDispatch();
  useOnMount(() =>
    addReplayActionListener(action => {
      if (isReplayableAction(action)) dispatch(action);
    })
  );
}
