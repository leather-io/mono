import { WhenClient } from '~/components/when-client';

import { ExplorationCanvas } from '../../shared/exploration/exploration-canvas';
import { receiveConfig } from './receive-example.config';

export default function ReceiveExampleRoute() {
  return (
    <WhenClient>
      <ExplorationCanvas config={receiveConfig} />
    </WhenClient>
  );
}
