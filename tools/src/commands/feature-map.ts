import type { Command } from 'commander';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { getFeatureMapAppConfig, toRepoRelative } from '../feature-map/app-config.js';
import { checkFeatureMap, formatCheckReport } from '../feature-map/check.js';
import { buildFeatureMapModel } from '../feature-map/model.js';
import { renderFeatureMap } from '../feature-map/render-markdown.js';

interface AppOptions {
  readonly app: string;
}

const defaultApp = 'extension';

function printParseErrors(errors: readonly string[]): void {
  console.error(`feature-map: ${errors.length} source error${errors.length === 1 ? '' : 's'}`);
  for (const error of errors) console.error(`  ${error}`);
}

function generate({ app }: AppOptions): void {
  const config = getFeatureMapAppConfig(app);
  const model = buildFeatureMapModel(config);
  if (model.parseErrors.length > 0) {
    printParseErrors(model.parseErrors);
    process.exitCode = 1;
    return;
  }
  mkdirSync(path.dirname(config.outputFile), { recursive: true });
  writeFileSync(config.outputFile, renderFeatureMap(model));
  console.log(
    `feature-map: wrote ${toRepoRelative(config.outputFile)} (${model.features.length} features)`
  );
}

function check({ app }: AppOptions): void {
  const model = buildFeatureMapModel(getFeatureMapAppConfig(app));
  const result = checkFeatureMap(model);
  const report = formatCheckReport(model, result);
  if (result.errors.length > 0) {
    console.error(report);
    process.exitCode = 1;
    return;
  }
  console.log(report);
}

export function registerFeatureMapCommands(program: Command): void {
  const featureMap = program
    .command('feature-map')
    .description('Per-feature inventory of an app: generator and rot check');

  featureMap
    .command('generate')
    .description(
      'Write the gitignored feature map markdown for agents from the *.features.ts sources'
    )
    .option('--app <app>', 'App to generate (extension, web)', defaultApp)
    .action(generate);

  featureMap
    .command('check')
    .description('Fail when a routed key or an rpc handler lacks an entry or references are broken')
    .option('--app <app>', 'App to check (extension, web)', defaultApp)
    .action(check);
}
