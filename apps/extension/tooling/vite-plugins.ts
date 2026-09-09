import type { CrxPlugin } from '@crxjs/vite-plugin';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

interface StaticAsset {
  fileName: string;
  sourcePath: string;
}

const pageContextArtifacts = ['content-script.js', 'inpage.js'];
const inlineSourceMapPattern = /\n?\/\/# sourceMappingURL=data:[^\n]+\n?$/;

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
  const browserPolyfillDirectory = path.join(
    extensionRoot,
    'node_modules/webextension-polyfill/dist'
  );
  return [
    ...collectStaticAssets(path.join(extensionRoot, 'public/assets'), 'assets'),
    {
      fileName: 'browser-polyfill.js',
      sourcePath: path.join(browserPolyfillDirectory, 'browser-polyfill.js'),
    },
    {
      fileName: 'browser-polyfill.js.map',
      sourcePath: path.join(browserPolyfillDirectory, 'browser-polyfill.js.map'),
    },
  ];
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
