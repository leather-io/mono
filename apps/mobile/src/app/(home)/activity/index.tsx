import { ActivityLayout } from './activity.layout';
import { StacksActivity } from './stacks/stacks-activity';

export default function ActivityScreen() {
  return (
    <ActivityLayout>
      <StacksActivity />
    </ActivityLayout>
  );
}
/**
 * Every step I take:
 *  2. Add fetch of STX activity for all wallets
 *  3. Add fetch of BTC activity for all wallets
 *  4. Add UI components
 *
 *
 *
 */
