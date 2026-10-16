import { Box, Flex } from 'leather-styles/jsx';

import { AboutNavigationProvider, AboutRail, AboutSectionPicker } from './canvas/about-navigation';
import { AboutView } from './canvas/about-view';
import {
  CanvasNarrowNavigation,
  type CanvasNavGroup,
  CanvasNavigationProvider,
  CanvasRail,
} from './canvas/canvas-navigation';
import { CanvasSettingsProvider, useCanvasSettings } from './canvas/canvas-settings';
import { CanvasToolbar } from './canvas/canvas-toolbar';
import { FramesView } from './canvas/frames-view';
import { IssuesPanel } from './canvas/issues-panel';
import { PrimitivesView } from './canvas/primitives-view';
import type { CanvasScreenSection } from './canvas/screen-sections';
import { ScreensGrid } from './canvas/screens-grid';
import { ScreensMatrix } from './canvas/screens-matrix';
import { ViewerView } from './canvas/viewer-view';
import { accountScenarios } from './scenarios/account-scenarios';
import { bitcoinScenarios } from './scenarios/bitcoin-scenarios';
import { connectScenarios } from './scenarios/connect-scenarios';
import { contractCallScenarios } from './scenarios/contract-call-scenarios';
import { ledgerStateScenarios } from './scenarios/ledger-state-scenarios';
import { messageScenarios } from './scenarios/message-scenarios';
import { permissionScenarios } from './scenarios/permission-scenarios';
import { queueScenarios } from './scenarios/queue-scenarios';
import { recipientNameScenarios } from './scenarios/recipient-name-scenarios';
import { rulesScenarios } from './scenarios/rules-scenarios';
import { sbtcScenarios } from './scenarios/sbtc-scenarios';
import type { Scenario } from './scenarios/scenario';
import { signTransactionScenarios } from './scenarios/sign-transaction-scenarios';
import { simulationScenarios } from './scenarios/simulation-scenarios';
import { sip030Scenarios } from './scenarios/sip030-scenarios';
import { sourceScenarios } from './scenarios/source-scenarios';
import { speedUpScenarios } from './scenarios/speed-up-scenarios';
import { stakingScenarios } from './scenarios/staking-scenarios';
import { stateScenarios } from './scenarios/state-scenarios';
import { transferScenarios } from './scenarios/transfer-scenarios';
import { vaultQueueScenarios } from './scenarios/vault-queue-scenarios';

const screenSections: CanvasScreenSection[] = [
  { id: 'accounts', label: 'Accounts and networks', scenarios: rulesScenarios },
  { id: 'connect', label: 'Connect', scenarios: connectScenarios },
  { id: 'source', label: 'Who is asking', scenarios: sourceScenarios },
  { id: 'sip-030', label: 'SIP-030 gaps', scenarios: sip030Scenarios },
  {
    id: 'contract-call',
    label: 'Stacks contract calls',
    scenarios: [...contractCallScenarios, ...simulationScenarios],
  },
  {
    id: 'staking',
    label: 'Staking and sBTC',
    scenarios: [...stakingScenarios, ...permissionScenarios, ...sbtcScenarios],
  },
  {
    id: 'transfer',
    label: 'Stacks transfers',
    scenarios: [...transferScenarios, ...recipientNameScenarios],
  },
  {
    id: 'sign-transaction',
    label: 'App-built transactions',
    scenarios: signTransactionScenarios,
  },
  { id: 'bitcoin', label: 'Bitcoin', scenarios: bitcoinScenarios },
  { id: 'message', label: 'Messages', scenarios: messageScenarios },
  {
    id: 'account',
    label: 'Vault accounts',
    scenarios: [...accountScenarios, ...vaultQueueScenarios],
  },
  { id: 'state', label: 'States', scenarios: [...stateScenarios, ...queueScenarios] },
  {
    id: 'ledger',
    label: 'Ledger and results',
    scenarios: [...ledgerStateScenarios, ...speedUpScenarios],
  },
];

function toNavItems(scenarios: Scenario[]) {
  return scenarios.map(scenario => ({
    id: scenario.id,
    label: scenario.label,
    method: scenario.method,
  }));
}

const navigationGroups: CanvasNavGroup[] = screenSections.map(section => ({
  id: section.id,
  label: section.label,
  targetId: section.id,
  items: toNavItems(section.scenarios),
}));

function ScreensBody() {
  const { isCompare } = useCanvasSettings();
  if (isCompare) return <ScreensMatrix sections={screenSections} />;
  return <ScreensGrid sections={screenSections} />;
}

function CanvasMain() {
  const { view } = useCanvasSettings();
  if (view === 'primitives') return <PrimitivesView />;
  if (view === 'about') return <AboutView sections={screenSections} />;
  if (view === 'viewer') return <ViewerView sections={screenSections} />;
  return <ScreensBody />;
}

function CanvasBody() {
  const { view, theme } = useCanvasSettings();
  if (view === 'frames') return <FramesView sections={screenSections} />;
  const isAbout = view === 'about';
  const isPrimitives = view === 'primitives';
  return (
    <AboutNavigationProvider>
      <Flex
        className={isPrimitives && theme === 'dark' ? 'dark' : undefined}
        alignItems="flex-start"
        bg="ink.background-primary"
        color="ink.text-primary"
        minHeight="100vh"
      >
        {!isPrimitives && (isAbout ? <AboutRail /> : <CanvasRail />)}
        <Box flex="1" minWidth="0" px={{ base: 'space.05', lg: 'space.08' }}>
          <CanvasToolbar
            navigation={
              !isPrimitives && (
                <CanvasNarrowNavigation picker={isAbout ? <AboutSectionPicker /> : undefined} />
              )
            }
          />
          <CanvasMain />
        </Box>
        {!isPrimitives && <IssuesPanel sections={screenSections} />}
      </Flex>
    </AboutNavigationProvider>
  );
}

export function ApprovalFlowsPage() {
  return (
    <CanvasSettingsProvider>
      <CanvasNavigationProvider groups={navigationGroups}>
        <CanvasBody />
      </CanvasNavigationProvider>
    </CanvasSettingsProvider>
  );
}
