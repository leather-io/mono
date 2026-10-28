import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

import { getFeatureMapAppConfig, toRepoRelative } from '../feature-map/app-config.js';
import { buildFeatureMapModel } from '../feature-map/model.js';
import { loadVerifyInputs } from '../feature-map/test-assets.js';
import { getMonorepoRoot } from '../utils/paths.js';
import { buildTestCommand, checkDist, devServerWarning, findDevServer } from './preflight.js';
import { VerifyArgumentError, type VerifyCliOptions, resolveVerifyRun } from './resolve.js';
import {
  type VerifyRun,
  summaryFileName,
  toVerifyEnv,
  verifyExitCodes,
  verifyVerdicts,
} from './verify-contract.js';

export type { VerifyCliOptions } from './resolve.js';

const supportedApp = 'extension';
const specPath = 'tests/verify/verify-screen.spec.ts';
const maxPrintedUrls = 10;
const playwrightOutputDirName = 'playwright';
const verifyEnvPrefix = 'VERIFY_';
const ciEnvName = 'CI';

function childEnvironment(run: VerifyRun): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key === ciEnvName || key.startsWith(verifyEnvPrefix)) continue;
    env[key] = value;
  }
  return { ...env, ...toVerifyEnv(run) };
}

function clearPreviousRun(outDir: string): void {
  rmSync(path.join(outDir, summaryFileName), { force: true });
  rmSync(path.join(outDir, playwrightOutputDirName), { recursive: true, force: true });
}

function summaryWrittenAfter(outDir: string, startedAt: number): boolean {
  const file = path.join(outDir, summaryFileName);
  if (!existsSync(file)) return false;
  return statSync(file).mtimeMs >= startedAt;
}

function readParamsFile(file: string): unknown {
  if (!existsSync(file)) {
    throw new VerifyArgumentError(`verify: --params file ${file} does not exist.`);
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    throw new VerifyArgumentError(`verify: --params file ${file} is not valid JSON.`);
  }
}

function readProcessList(): string | undefined {
  try {
    return execFileSync('ps', ['-axo', 'command'], { encoding: 'utf8' });
  } catch {
    return undefined;
  }
}

function describeRpc(run: VerifyRun): string {
  if (!run.rpc) return '(none)';
  if (run.rpc.catalogId !== undefined) return `${run.rpc.method} via catalog:${run.rpc.catalogId}`;
  return `${run.rpc.method}${run.rpc.params === undefined ? ' without params' : ' with params'}`;
}

function printDerived(run: VerifyRun, warnings: readonly string[]): void {
  const lines = [
    `verify: ${run.feature ? `feature ${run.feature}` : 'route'} -> ${run.route}`,
    `  open: ${run.open.length > 0 ? run.open.join(' -> ') : '(none)'}`,
    `  session: ${run.session} (${run.accountType} wallet, network ${run.network}${run.connectTestApp ? ', test app connected' : ''})`,
    `  flags: ${Object.keys(run.flags).length > 0 ? JSON.stringify(run.flags) : '(none)'}`,
    `  mocks: ${run.mocksMode === 'none' ? 'none (real network)' : run.mocks.join(', ')}`,
    `  ready: ${run.ready ?? '(document only)'}`,
    `  rpc: ${describeRpc(run)}`,
    `  state: ${run.stateSlices.join(', ')}`,
    `  console errors: ${run.allowConsoleErrors ? 'allowed' : 'blocking unless allowlisted'}`,
    `  out: ${toRepoRelative(run.outDir)}`,
  ];
  console.log(lines.join('\n'));
  for (const warning of warnings) console.warn(`verify: ${warning}`);
}

function runBuild(root: string): number {
  console.log(`verify: ${buildTestCommand}`);
  const [command, ...args] = buildTestCommand.split(' ');
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  return result.status ?? verifyExitCodes.env;
}

interface SummaryLike {
  readonly verdict?: string;
  readonly ready?: { readonly attached?: boolean; readonly waitedMs?: number };
  readonly finalUrl?: string;
  readonly network?: {
    readonly counts?: Readonly<Record<string, number>>;
    readonly realUrls?: readonly string[];
    readonly blockingReal?: number;
  };
  readonly console?: { readonly blocking?: number; readonly allowlisted?: number };
  readonly backgroundErrors?: number;
  readonly backgroundErrorsUnavailable?: string;
  readonly rpc?: { readonly catalogId?: string; readonly popupUrl?: string | null };
  readonly mocks?: { readonly skipped?: readonly string[] };
  readonly blocking?: readonly string[];
}

function readSummary(outDir: string): SummaryLike | undefined {
  const file = path.join(outDir, summaryFileName);
  if (!existsSync(file)) return undefined;
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
    return typeof parsed === 'object' && parsed !== null ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function envFailure(message: string): number {
  console.error(message);
  return verifyExitCodes.env;
}

function exitCodeFor(verdict: string | undefined): number {
  const known = verifyVerdicts.find(candidate => candidate === verdict);
  return known === undefined ? verifyExitCodes.env : verifyExitCodes[known];
}

function printResult(run: VerifyRun, summary: SummaryLike): void {
  const counts = summary.network?.counts ?? {};
  const countText = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => `${name} ${count}`)
    .join(', ');
  console.log(
    `verify: verdict ${summary.verdict ?? 'unknown'}; ready selector ${summary.ready?.attached === true ? 'appeared' : 'did not appear'} after ${summary.ready?.waitedMs ?? 0} ms`
  );
  if (summary.finalUrl) console.log(`  url: ${summary.finalUrl}`);
  const backgroundText =
    summary.backgroundErrorsUnavailable === undefined
      ? `${summary.backgroundErrors ?? 0} error${summary.backgroundErrors === 1 ? '' : 's'}`
      : `unknown (${summary.backgroundErrorsUnavailable})`;
  console.log(
    `  console: ${summary.console?.blocking ?? 0} blocking error${summary.console?.blocking === 1 ? '' : 's'}, ${summary.console?.allowlisted ?? 0} allowlisted; background: ${backgroundText}`
  );
  console.log(`  network: ${countText || 'no requests'}`);
  for (const url of (summary.network?.realUrls ?? []).slice(0, maxPrintedUrls)) {
    console.log(`  real: ${url}`);
  }
  if (summary.rpc?.catalogId !== undefined) {
    console.log(`  rpc params: catalog:${summary.rpc.catalogId}`);
  }
  if (summary.rpc?.popupUrl) console.log(`  rpc popup: ${summary.rpc.popupUrl}`);
  for (const reason of summary.blocking ?? []) console.log(`  blocking: ${reason}`);
  const skipped = summary.mocks?.skipped ?? [];
  if (skipped.length > 0) console.log(`  mocks skipped (need arguments): ${skipped.join(', ')}`);
  console.log(`  artifacts: ${toRepoRelative(run.outDir)}`);
}

export function runVerify(app: string, options: VerifyCliOptions): number {
  if (app !== supportedApp) {
    console.error(`verify: unsupported app '${app}'. Fix: pnpm lt verify ${supportedApp} …`);
    return verifyExitCodes.usage;
  }
  const root = getMonorepoRoot();
  const config = getFeatureMapAppConfig(app);
  const model = buildFeatureMapModel(config);
  for (const parseError of model.parseErrors) console.error(`verify: ${parseError}`);

  let resolved;
  try {
    resolved = resolveVerifyRun(model, loadVerifyInputs(config), options, {
      now: new Date(),
      cwd: process.env.INIT_CWD ?? process.cwd(),
      readParams: readParamsFile,
    });
  } catch (error) {
    if (error instanceof VerifyArgumentError) {
      console.error(error.message);
      return verifyExitCodes.usage;
    }
    throw error;
  }
  const { run, warnings } = resolved;
  printDerived(run, warnings);

  if (options.build) {
    const buildStatus = runBuild(root);
    if (buildStatus !== 0) {
      return envFailure(`verify: ${buildTestCommand} failed with status ${buildStatus}.`);
    }
  }
  const distError = checkDist(path.join(config.appDir, 'dist', 'manifest.json'));
  if (distError) return envFailure(distError);
  const devServer = findDevServer(readProcessList(), root);
  if (devServer && !options.build) console.warn(devServerWarning(devServer));

  mkdirSync(run.outDir, { recursive: true });
  clearPreviousRun(run.outDir);
  const startedAt = Date.now();
  const result = spawnSync(
    'pnpm',
    [
      '--filter',
      '@leather.io/extension',
      'exec',
      'playwright',
      'test',
      specPath,
      '--reporter=line',
      '--workers=1',
      `--output=${path.join(run.outDir, playwrightOutputDirName)}`,
    ],
    { cwd: root, stdio: 'inherit', env: childEnvironment(run) }
  );
  const summary = summaryWrittenAfter(run.outDir, startedAt) ? readSummary(run.outDir) : undefined;
  if (!summary) {
    return envFailure(
      `verify: the run ended with status ${result.status ?? 'unknown'} before ${summaryFileName} was written. Read the Playwright output above; the usual causes are a missing dist, a stale dist from pnpm dev, a page-object action that threw, or the test app failing to start on port 3000.`
    );
  }
  printResult(run, summary);
  return exitCodeFor(summary.verdict);
}
