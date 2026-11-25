import { toRepoRelative } from './app-config.js';
import { type FeatureMapModel, routeRef, unkeyedRoutes, unroutedKeys } from './model.js';

export function checkExpoRoutes(model: FeatureMapModel): string[] {
  const { expoRouter, routeUrlsObjectName, routeUrlsFile } = model.config;
  if (!expoRouter) return [];
  const errors: string[] = [];
  const appDir = toRepoRelative(expoRouter.appDir);
  const routesFile = toRepoRelative(routeUrlsFile);
  for (const route of unkeyedRoutes(model)) {
    errors.push(
      [
        `screen ${toRepoRelative(route.file)} routes at '${route.mountedPath}' but no ${routeUrlsObjectName} key has that value.`,
        `Fix: add a key with value '${route.mountedPath}' to ${routesFile} and claim it in an entry.`,
      ].join('\n')
    );
  }
  for (const key of unroutedKeys(model)) {
    errors.push(
      [
        `${routeRef(model, key)} ('${model.routeUrls.get(key) ?? ''}') matches no screen file under ${appDir}.`,
        `Fix: point the value at the screen's path (its file path without the extension, index and (group) segments) or remove the key.`,
      ].join('\n')
    );
  }
  return errors;
}
