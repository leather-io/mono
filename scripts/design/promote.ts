// Promote report: how far a Playground sketch deviates from the Leather design
// system, and what to do about each deviation. See docs/design/promote.md.
//
//   node scripts/design/promote.ts <area-or-variant-folder> [--out report.md] [--json summary.json]
//                                  [--system leather-system.json] [--quiet]
//
// Markdown goes to stdout (unless --quiet). --out also writes it to a file and,
// unless --json says otherwise, writes the JSON summary next to it (<out>.json).
// --json - prints the JSON summary to stdout instead of the markdown.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { analyze } from './lib/analyze.ts';
import { jsonSummary, renderMarkdown } from './lib/report.ts';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    json: { type: 'string' },
    system: { type: 'string' },
    quiet: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (values.help || positionals.length !== 1) {
  console.log(
    'Usage: node scripts/design/promote.ts <area-or-variant-folder> [--out report.md] [--json summary.json] [--system leather-system.json] [--quiet]'
  );
  process.exit(values.help ? 0 : 1);
}

const result = await analyze(positionals[0], { systemJson: values.system });
const markdown = renderMarkdown(result);
const json = `${JSON.stringify(jsonSummary(result), null, 2)}\n`;

function write(file: string, content: string) {
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  writeFileSync(file, content);
}

if (values.out) write(values.out, markdown);
const jsonPath =
  values.json ?? (values.out ? values.out.replace(/\.md$/, '') + '.json' : undefined);
if (jsonPath && jsonPath !== '-') write(jsonPath, json);

if (jsonPath === '-') process.stdout.write(json);
else if (!values.quiet) process.stdout.write(markdown);
else console.log(result.drift.line);
