import type { CrxPlugin } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { type Plugin, type PluginOption, type ResolvedConfig, build } from 'vite';

interface StaticAsset {
  fileName: string;
  sourcePath: string;
}

const pageContextArtifacts = ['content-script.js', 'inpage.js'];
const inlineSourceMapPattern = /\n?\/\/# sourceMappingURL=data:[^\n]+\n?$/;
const inpageScriptFileName = 'inpage.js';

function collectStaticAssets(directory: string, prefix = ''): StaticAsset[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const sourcePath = path.join(directory, entry.name);
    const fileName = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) return collectStaticAssets(sourcePath, fileName);
    return [{ fileName, sourcePath }];
  });
}

function getStaticAssets(extensionRoot: string) {
  return collectStaticAssets(path.join(extensionRoot, 'public/assets'), 'assets');
}

export function copyExtensionAssets(extensionRoot: string): Plugin {
  return {
    name: 'copy-extension-assets',
    apply: 'build',
    buildStart() {
      getStaticAssets(extensionRoot).forEach(file => {
        this.addWatchFile(file.sourcePath);
        this.emitFile({
          type: 'asset',
          fileName: file.fileName,
          source: readFileSync(file.sourcePath),
        });
      });
    },
  };
}

export function buildInpageScript(inpageEntry: string): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'crx:inpage-script',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async generateBundle() {
      if (config.command !== 'serve') return;
      const result = await build({
        configFile: false,
        logLevel: 'warn',
        root: config.root,
        mode: config.mode,
        define: config.define,
        resolve: config.resolve,
        build: {
          write: false,
          emptyOutDir: false,
          minify: false,
          sourcemap: false,
          target: config.build.target,
          lib: {
            entry: inpageEntry,
            formats: ['iife'],
            name: 'leatherInpage',
            fileName: () => inpageScriptFileName,
          },
        },
      });
      const outputs = Array.isArray(result) ? result : [result];
      const entryChunk = outputs
        .flatMap(output => ('output' in output ? output.output : []))
        .find(output => output.type === 'chunk' && output.isEntry);
      if (!entryChunk || entryChunk.type !== 'chunk') {
        this.error(`Unable to build page context script ${inpageEntry}`);
      }
      this.emitFile({
        type: 'asset',
        fileName: inpageScriptFileName,
        source: entryChunk.code,
      });
    },
  };
}

function removeSourceMapsFromManifest(outputDirectory: string) {
  const manifestPath = path.join(outputDirectory, 'manifest.json');
  if (!existsSync(manifestPath)) return;
  const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (typeof manifest !== 'object' || manifest === null) return;
  const webAccessibleResources = Reflect.get(manifest, 'web_accessible_resources');
  if (!Array.isArray(webAccessibleResources)) return;
  webAccessibleResources.forEach(resource => {
    if (typeof resource !== 'object' || resource === null) return;
    const resources = Reflect.get(resource, 'resources');
    if (!Array.isArray(resources)) return;
    Reflect.set(
      resource,
      'resources',
      resources.filter(fileName => typeof fileName !== 'string' || !fileName.endsWith('.map'))
    );
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function stripPageContextSourceMaps(outputDirectory: string) {
  pageContextArtifacts.forEach(fileName => {
    rmSync(path.join(outputDirectory, `${fileName}.map`), { force: true });
    const filePath = path.join(outputDirectory, fileName);
    if (!existsSync(filePath)) return;
    const code = readFileSync(filePath, 'utf8');
    const codeWithoutSourceMap = code.replace(inlineSourceMapPattern, '\n');
    if (codeWithoutSourceMap !== code) writeFileSync(filePath, codeWithoutSourceMap);
  });
}

export function protectPageContextArtifacts(inpageBuildMatch: string): CrxPlugin {
  let outputDirectory = '';
  return {
    name: 'protect-page-context-artifacts',
    configResolved(config) {
      outputDirectory = config.build.outDir;
    },
    renderCrxDevScript(code, script) {
      if (!pageContextArtifacts.some(fileName => script.id.includes(fileName.replace('.js', '')))) {
        return;
      }
      return code.replace(inlineSourceMapPattern, '\n');
    },
    renderCrxManifest(manifest) {
      const webAccessibleResources = manifest.web_accessible_resources?.map(resource => ({
        ...resource,
        resources: resource.resources.filter(fileName => !fileName.endsWith('.map')),
      }));
      const contentScripts = manifest.content_scripts?.filter(
        contentScript => !contentScript.matches?.includes(inpageBuildMatch)
      );
      return {
        ...manifest,
        ...(contentScripts ? { content_scripts: contentScripts } : {}),
        ...(webAccessibleResources ? { web_accessible_resources: webAccessibleResources } : {}),
      };
    },
    closeBundle() {
      stripPageContextSourceMaps(outputDirectory);
      removeSourceMapsFromManifest(outputDirectory);
    },
  };
}

export function assertServiceWorkerCompatibility(backgroundEntry: string): Plugin {
  return {
    name: 'assert-service-worker-compatibility',
    generateBundle(_, bundle) {
      const chunks = Object.values(bundle).filter(output => output.type === 'chunk');
      const backgroundChunk = chunks.find(output => output.facadeModuleId === backgroundEntry);
      if (!backgroundChunk) this.error(`Unable to find service worker entry ${backgroundEntry}`);
      const visited = new Set<string>();
      const queue = [backgroundChunk];
      const dynamicImports: string[] = [];
      while (queue.length > 0) {
        const chunk = queue.shift();
        if (!chunk || visited.has(chunk.fileName)) continue;
        visited.add(chunk.fileName);
        dynamicImports.push(...chunk.dynamicImports);
        chunk.imports.forEach(fileName => {
          const imported = chunks.find(output => output.fileName === fileName);
          if (imported) queue.push(imported);
        });
      }
      if (dynamicImports.length === 0) return;
      this.error(
        `Service worker graph has unsupported dynamic imports: ${dynamicImports.join(', ')}`
      );
    },
  };
}

export function polyfillProcessBeforeViteEnv(processShimSpecifier: string): Plugin {
  return {
    name: 'polyfill-process-before-vite-env',
    apply: 'serve',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/vite/dist/client/env.mjs')) return;
      return {
        code: [
          `import processPolyfill from ${JSON.stringify(processShimSpecifier)};`,
          'globalThis.process = globalThis.process || processPolyfill;',
          code,
        ].join('\n'),
        map: null,
      };
    },
  };
}

const reactRefreshPreambleId = '/@react-refresh-preamble';

function isPlugin(plugin: PluginOption): plugin is Plugin {
  return typeof plugin === 'object' && plugin !== null && 'name' in plugin;
}

export function reactWithExternalRefreshPreamble(): Plugin[] {
  const plugins = react().filter(isPlugin);
  const refreshPlugin = plugins.find(plugin => typeof plugin.transformIndexHtml === 'function');
  if (!refreshPlugin) throw new Error('Unable to find the React refresh plugin');
  let base = '/';
  refreshPlugin.transformIndexHtml = (_, context) => {
    if (!context.server) return;
    return [
      {
        tag: 'script',
        attrs: { type: 'module', src: reactRefreshPreambleId },
        injectTo: 'head-prepend',
      },
    ];
  };
  return [
    ...plugins,
    {
      name: 'react-refresh-preamble-module',
      apply: 'serve',
      configResolved(config) {
        base = config.base;
      },
      resolveId(source) {
        if (source === reactRefreshPreambleId) return reactRefreshPreambleId;
        return null;
      },
      load(id) {
        if (id === reactRefreshPreambleId) return react.preambleCode.replace('__BASE__', base);
        return null;
      },
    },
  ];
}
