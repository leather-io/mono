import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from './app-config.js';
import { isMaestroFlowFile, loadMaestroActions, loadMaestroFlows } from './maestro-flows.js';

const config = getFeatureMapAppConfig('mobile');
const maestro = config.maestro ?? { flowsDirs: [], actionsDir: '' };

describe(isMaestroFlowFile.name, () => {
  test('accepts yaml and yml only', () => {
    expect(isMaestroFlowFile('flows/smoke-tests.yaml')).toBe(true);
    expect(isMaestroFlowFile('flows/smoke-tests.yml')).toBe(true);
    expect(isMaestroFlowFile('flows/README.md')).toBe(false);
  });
});

describe(loadMaestroFlows.name, () => {
  test('lists the runnable flows and shared sub-flows of the mobile app, not the legacy ones', () => {
    const flows = loadMaestroFlows(maestro);
    expect(flows.has('apps/mobile/maestro/flows/smoke-tests.yaml')).toBe(true);
    expect(flows.has('apps/mobile/maestro/shared/unlock.yaml')).toBe(true);
    expect([...flows.keys()].some(flow => flow.includes('legacy-flows'))).toBe(false);
    expect(flows.get('apps/mobile/maestro/shared/unlock.yaml')?.routeKeys).toEqual([]);
  });
});

describe(loadMaestroActions.name, () => {
  test('keys every flow in the actions dir by its repo-relative path', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'maestro-actions-'));
    mkdirSync(path.join(dir, 'nested'));
    writeFileSync(path.join(dir, 'unlock.yaml'), 'appId: x');
    writeFileSync(path.join(dir, 'nested', 'add-wallet.yml'), 'appId: x');
    writeFileSync(path.join(dir, 'README.md'), 'not a flow');
    const actions = loadMaestroActions({ flowsDirs: [], actionsDir: dir });
    expect([...actions.keys()].map(key => path.basename(key)).sort()).toEqual([
      'add-wallet.yml',
      'unlock.yaml',
    ]);
    const unlock = [...actions.values()].find(action => action.file.endsWith('unlock.yaml'));
    expect(unlock).toMatchObject({ className: 'maestro', requiredParameters: 0, isStatic: false });
  });

  test('names the shared mobile sub-flows', () => {
    expect([...loadMaestroActions(maestro).keys()]).toEqual([
      'apps/mobile/maestro/shared/clean-up.yaml',
      'apps/mobile/maestro/shared/unlock.yaml',
    ]);
  });
});
