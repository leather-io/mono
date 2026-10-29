import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';

import type { ComponentMeta } from '../../packages/ui/src/utils/component-meta.shared.ts';
import { arrayValue, objectValue, stringValue } from './lib/values.ts';

function componentMeta(value: unknown): ComponentMeta {
  const meta = objectValue(value);
  const importFrom = objectValue(meta.importFrom);
  const web = importFrom.web;
  const native = importFrom.native;
  if (web !== undefined && web !== '@leather.io/ui' && web !== '@leather.io/ui/native')
    throw new Error('Invalid web import');
  if (native !== undefined && native !== '@leather.io/ui' && native !== '@leather.io/ui/native')
    throw new Error('Invalid native import');
  return {
    name: stringValue(meta.name),
    importFrom: {
      ...(web === undefined ? {} : { web }),
      ...(native === undefined ? {} : { native }),
    },
    useWhen: arrayValue(meta.useWhen).map(stringValue),
    dontUseWhen: arrayValue(meta.dontUseWhen).map(value => {
      const alternative = objectValue(value);
      return { situation: stringValue(alternative.situation), use: stringValue(alternative.use) };
    }),
    replaces: arrayValue(meta.replaces).map(stringValue),
    examples: arrayValue(meta.examples).map(value => {
      const example = objectValue(value);
      const platform = example.platform;
      if (platform !== 'web' && platform !== 'native') throw new Error('Invalid example platform');
      return {
        title: stringValue(example.title),
        platform,
        code: stringValue(example.code),
        ...(example.seenIn === undefined ? {} : { seenIn: stringValue(example.seenIn) }),
      };
    }),
    ...(meta.playground === undefined ? {} : { playground: stringValue(meta.playground) }),
  };
}

// Meta files import their helper without an extension (bundler style). Node's
// type stripping needs one, so retry relative imports with `.ts`.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (!specifier.startsWith('.') || specifier.endsWith('.ts')) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

const root = path.resolve(import.meta.dirname, '../..');
const outFile = path.join(root, 'docs/design/cheatsheet.md');
const metaFiles = globSync('packages/ui/src/components/**/*.meta.shared.ts', { cwd: root }).sort();

const sections: string[] = [];
for (const file of metaFiles) {
  const imported: unknown = await import(path.join(root, file));
  for (const value of Object.values(objectValue(imported))) {
    const meta = componentMeta(value);
    const imports = Object.entries(meta.importFrom).map(
      ([platform, from]) => `${platform}: \`${from}\``
    );
    sections.push(
      [
        `## ${meta.name}`,
        `${imports.join(' · ')}${meta.playground ? ` · live: \`${meta.playground}\`` : ''}`,
        `**Use when**\n${meta.useWhen.map(line => `- ${line}`).join('\n')}`,
        `**Don't use when**\n${meta.dontUseWhen.map(alt => `- ${alt.situation} → \`${alt.use}\``).join('\n')}`,
        `**Replaces** ${meta.replaces.map(pattern => `\`${pattern}\``).join(', ')}`,
        ...meta.examples.map(
          example =>
            `**${example.title}** (${example.platform}${example.seenIn ? `, seen in \`${example.seenIn}\`` : ''})\n\n\`\`\`tsx\n${example.code}\n\`\`\``
        ),
      ].join('\n\n')
    );
  }
}

const raw = `# Component cheatsheet\n\nGenerated from packages/ui/src/components/**/*.meta.shared.ts. Do not edit by hand.\n\n${sections.join('\n\n---\n\n')}\n`;

// Format like the rest of the repo, otherwise pnpm format and --check fight each other.
const output = await format(raw, { ...(await resolveConfig(outFile)), filepath: outFile });

if (process.argv.includes('--check')) {
  const current = readFileSync(outFile, 'utf8');
  if (current !== output) {
    console.error(
      'docs/design/cheatsheet.md is stale. Run pnpm --filter @leather.io/ui gen:cheatsheet.'
    );
    process.exit(1);
  }
} else {
  writeFileSync(outFile, output);
}
