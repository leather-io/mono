// Generates docs/design/cheatsheet.md from every *.meta.shared.ts in packages/ui.
// pnpm --filter @leather.io/ui gen:cheatsheet          writes the file
// pnpm --filter @leather.io/ui gen:cheatsheet --check  fails CI when it is stale
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';

import type { ComponentMeta } from '../../packages/ui/src/utils/component-meta.shared.ts';

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
  const module: Record<string, ComponentMeta> = await import(path.join(root, file));
  for (const meta of Object.values(module)) {
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
