import { Buffer } from 'node:buffer';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { CrxPlugin } from '@crxjs/vite-plugin';
import type { Plugin } from 'vite';

interface StaticAsset {
  fileName: string;
  sourcePath: string;
}

const contentTypes: Record<string, string> = {
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.js': 'text/javascript',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function collectStaticAssets(directory: string, prefix = ''): StaticAsset[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const sourcePath = path.join(directory, entry.name);
    const fileName = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) return collectStaticAssets(sourcePath, fileName);
    return [{ fileName, sourcePath }];
  });
}

export function copyExtensionAssets(extensionRoot: string): Plugin {
  const browserPolyfillDirectory = path.join(
    extensionRoot,
    'node_modules/webextension-polyfill/dist'
  );
  const browserPolyfill: StaticAsset = {
    fileName: 'browser-polyfill.js',
    sourcePath: path.join(browserPolyfillDirectory, 'browser-polyfill.js'),
  };
  const files = [
    ...collectStaticAssets(path.join(extensionRoot, 'public/assets'), 'assets'),
    browserPolyfill,
  ];
  const filesByUrl = new Map(files.map(file => [`/${file.fileName}`, file]));
  let isBuild = false;

  return {
    name: 'copy-extension-assets',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    buildStart() {
      if (!isBuild) return;
      files.forEach(file => {
        this.addWatchFile(file.sourcePath);
        this.emitFile({
          type: 'asset',
          fileName: file.fileName,
          source: readFileSync(file.sourcePath),
        });
      });
    },
    configureServer(server) {
      server.watcher.add(files.map(file => file.sourcePath));
      server.middlewares.use((request, response, next) => {
        const requestPath = request.url?.split('?')[0];
        const file = requestPath ? filesByUrl.get(requestPath) : undefined;
        if (!file) {
          next();
          return;
        }
        response.setHeader(
          'Content-Type',
          contentTypes[path.extname(file.fileName)] ?? 'application/octet-stream'
        );
        response.end(readFileSync(file.sourcePath));
      });
    },
  };
}

function getAssetSize(source: string | Uint8Array) {
  if (typeof source === 'string') return Buffer.byteLength(source);
  return source.byteLength;
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

function removePageContextSourceMaps(directory: string) {
  if (!existsSync(directory)) return;
  readdirSync(directory, { withFileTypes: true }).forEach(entry => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      removePageContextSourceMaps(filePath);
      return;
    }
    if (!entry.name.endsWith('.map')) return;
    if (
      !entry.name.includes('content-script') &&
      !entry.name.includes('inpage') &&
      !entry.name.includes('browser-polyfill')
    )
      return;
    rmSync(filePath, { force: true });
  });
}

export function excludePageContextSourceMaps(extensionRoot: string): CrxPlugin {
  const outputDirectory = path.join(extensionRoot, 'dist');
  return {
    name: 'exclude-page-context-source-maps',
    generateBundle(_options, bundle) {
      Object.keys(bundle).forEach(fileName => {
        if (!fileName.endsWith('.map')) return;
        if (!fileName.includes('content-script') && !fileName.includes('inpage')) return;
        delete bundle[fileName];
      });
    },
    renderCrxManifest(manifest) {
      const webAccessibleResources = manifest.web_accessible_resources?.map(resource => ({
        ...resource,
        resources: resource.resources.filter(fileName => !fileName.endsWith('.map')),
      }));
      return {
        ...manifest,
        ...(webAccessibleResources ? { web_accessible_resources: webAccessibleResources } : {}),
      };
    },
    writeBundle(options) {
      if (typeof options.dir !== 'string') return;
      removePageContextSourceMaps(options.dir);
      removeSourceMapsFromManifest(options.dir);
    },
    closeBundle() {
      removePageContextSourceMaps(outputDirectory);
      removeSourceMapsFromManifest(outputDirectory);
    },
  };
}

export function assertChunkSizes(maxSize: number): Plugin {
  return {
    name: 'assert-chunk-sizes',
    generateBundle(_options, bundle) {
      Object.values(bundle).forEach(output => {
        if (!output.fileName.endsWith('.js')) return;
        const size =
          output.type === 'chunk'
            ? Buffer.byteLength(output.code)
            : getAssetSize(output.source);
        if (size <= maxSize) return;
        this.error(`${output.fileName} is ${size} bytes and exceeds the ${maxSize} byte limit`);
      });
    },
  };
}
