import { Circle } from 'leather-styles/jsx';
import { ConnectActionRow, ConnectCard } from '~/components/connect-card/connect-card';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Button, DownloadIcon, UserIcon } from '@leather.io/ui';

import { useStakingConnectAction } from '../hooks/use-staking-connect-action';

const { connectGate } = bitcoinStakingContent;

interface StakingConnectCardProps {
  title: string;
  description: string;
}

export function StakingConnectCard({ title, description }: StakingConnectCardProps) {
  const connectAction = useStakingConnectAction();

  if (connectAction.status === 'connected') return null;

  if (connectAction.status === 'install') {
    return (
      <ConnectCard title={title} description={description} maxWidth="560px">
        <ConnectActionRow
          hideBodyBelowSm
          img={
            <Circle border="default" size="48px">
              <DownloadIcon />
            </Circle>
          }
          title={connectGate.installRowTitle}
          description={connectGate.installRowDescription}
          trailing={
            <Button
              width="100px"
              height="48px"
              onClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}
            >
              {connectGate.installAction}
            </Button>
          }
        />
      </ConnectCard>
    );
  }

  return (
    <ConnectCard title={title} description={description} maxWidth="560px">
      <ConnectActionRow
        hideBodyBelowSm
        img={
          <Circle border="default" size="48px">
            <UserIcon />
          </Circle>
        }
        title={connectGate.connectRowTitle}
        description={connectGate.connectRowDescription}
        trailing={
          <Button
            width="100px"
            height="48px"
            disabled={connectAction.status === 'pending'}
            aria-busy={connectAction.status === 'pending' || undefined}
            onClick={() => {
              if (connectAction.status === 'connect') void connectAction.run();
            }}
          >
            {connectGate.connectAction}
          </Button>
        }
      />
    </ConnectCard>
  );
}
