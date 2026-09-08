import type { CrxPlugin } from '@crxjs/vite-plugin';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { type InlineConfig, type Plugin, build } from 'vite';

interface StaticAsset {
  fileName: string;
  sourcePath: string;
}

interface IsolatedServiceWorkerOptions {
  backgroundEntry: string;
  config: InlineConfig;
  targetBrowser: 'chromium' | 'firefox';
}

type ViteBuildOutput = Extract<Awaited<ReturnType<typeof build>>, { output: unknown }>;
type ViteOutputAsset = Extract<ViteBuildOutput['output'][number], { type: 'asset' }>;
type ViteOutputChunk = Extract<ViteBuildOutput['output'][number], { type: 'chunk' }>;

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

function isRollupOutput(value: Awaited<ReturnType<typeof build>>): value is ViteBuildOutput {
  return !Array.isArray(value) && 'output' in value;
}

function getIsolatedWorkerChunk(output: ViteBuildOutput, backgroundEntry: string) {
  return output.output.find(
    (file): file is ViteOutputChunk =>
      file.type === 'chunk' && file.facadeModuleId === backgroundEntry
  );
}

function getAssetSource(asset: ViteOutputAsset) {
  return typeof asset.source === 'string' ? asset.source : new Uint8Array(asset.source);
}

function writeBuildFile(outputDirectory: string, fileName: string, source: string | Uint8Array) {
  const filePath = path.join(outputDirectory, fileName);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, source);
}

function replaceManifestBackground(
  manifest: object,
  targetBrowser: 'chromium' | 'firefox',
  workerFileName: string
) {
  Reflect.set(
    manifest,
    'background',
    targetBrowser === 'firefox'
      ? { scripts: [workerFileName], type: 'module' }
      : { service_worker: workerFileName, type: 'module' }
  );
}

export function isolateServiceWorker({
  backgroundEntry,
  config,
  targetBrowser,
}: IsolatedServiceWorkerOptions): Plugin {
  const workerFileName = 'background.js';
  let isolatedBuild: ViteBuildOutput | undefined;
  return {
    name: 'isolate-service-worker',
    apply: 'build',
    async buildStart() {
      const result = await build({
        ...config,
        configFile: false,
        build: {
          ...config.build,
          emptyOutDir: false,
          write: false,
          rollupOptions: {
            ...config.build?.rollupOptions,
            input: backgroundEntry,
            output: {
              assetFileNames: 'assets/background-[name]-[hash][extname]',
              chunkFileNames: 'assets/background-[name]-[hash].js',
              entryFileNames: workerFileName,
              format: 'es',
              hoistTransitiveImports: false,
              inlineDynamicImports: true,
            },
          },
        },
      });
      if (!isRollupOutput(result)) this.error('Isolated service worker build did not complete');
      isolatedBuild = result;
    },
    writeBundle(options, bundle) {
      if (!isolatedBuild) this.error('Isolated service worker build output is unavailable');
      const workerChunk = getIsolatedWorkerChunk(isolatedBuild, backgroundEntry);
      if (!workerChunk)
        this.error(`Unable to find isolated service worker entry ${backgroundEntry}`);
      if (workerChunk.imports.length > 0 || workerChunk.dynamicImports.length > 0) {
        this.error(
          `Isolated service worker has unsupported imports: ${[
            ...workerChunk.imports,
            ...workerChunk.dynamicImports,
          ].join(', ')}`
        );
      }
      const outputDirectory = options.dir;
      if (!outputDirectory) throw new Error('Extension output directory is unavailable');
      const manifestPath = path.join(outputDirectory, 'manifest.json');
      if (!existsSync(manifestPath)) this.error('Unable to find generated extension manifest');
      const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
      if (typeof manifest !== 'object' || manifest === null) {
        this.error('Generated extension manifest is invalid');
      }
      Object.values(bundle).forEach(output => {
        if (output.type === 'chunk' && output.facadeModuleId === backgroundEntry) {
          rmSync(path.join(outputDirectory, output.fileName), { force: true });
          rmSync(path.join(outputDirectory, `${output.fileName}.map`), { force: true });
        }
      });
      const currentBackground = Reflect.get(manifest, 'background');
      if (typeof currentBackground === 'object' && currentBackground !== null) {
        const serviceWorker = Reflect.get(currentBackground, 'service_worker');
        const scripts = Reflect.get(currentBackground, 'scripts');
        if (typeof serviceWorker === 'string') {
          rmSync(path.join(outputDirectory, serviceWorker), { force: true });
        }
        if (Array.isArray(scripts)) {
          scripts.forEach(script => {
            if (typeof script === 'string') {
              rmSync(path.join(outputDirectory, script), { force: true });
            }
          });
        }
      }
      replaceManifestBackground(manifest, targetBrowser, workerFileName);
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      writeBuildFile(outputDirectory, workerFileName, workerChunk.code);
      if (workerChunk.map) {
        writeBuildFile(outputDirectory, `${workerFileName}.map`, workerChunk.map.toString());
      }
      isolatedBuild.output.forEach(output => {
        if (output.type !== 'asset') return;
        if (existsSync(path.join(outputDirectory, output.fileName))) return;
        writeBuildFile(outputDirectory, output.fileName, getAssetSource(output));
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
      const backgroundChunk = Object.values(bundle)
        .filter(output => output.type === 'chunk')
        .find(output => output.facadeModuleId === backgroundEntry);
      if (!backgroundChunk) this.error(`Unable to find service worker entry ${backgroundEntry}`);
      if (backgroundChunk.dynamicImports.length === 0) return;
      this.error(
        `Service worker entry has unsupported dynamic imports: ${backgroundChunk.dynamicImports.join(', ')}`
      );
    },
  };
}

function collectJavaScriptFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(filePath);
    return entry.name.endsWith('.js') ? [filePath] : [];
  });
}

export function assertChunkSizes(maxSize: number, remediation: string): Plugin {
  let outputDirectory = '';
  let shouldCheck = false;
  return {
    name: 'assert-chunk-sizes',
    configResolved(config) {
      outputDirectory = config.build.outDir;
      shouldCheck = config.command === 'build' && config.build.sourcemap !== 'inline';
    },
    closeBundle() {
      if (!shouldCheck) return;
      collectJavaScriptFiles(outputDirectory).forEach(filePath => {
        const size = statSync(filePath).size;
        if (size <= maxSize) return;
        this.error(
          `${path.relative(outputDirectory, filePath)} is ${size} bytes and exceeds the ${maxSize} byte limit. ${remediation}`
        );
      });
    },
  };
}
