type RouteParams = Record<string, string | number | undefined>;

/**
 * Replaces route parameters in a given path with provided values.
 * @param route - The route string containing parameters (e.g., "/swap/:base/:quote").
 * @param params - An object where keys are parameter names and values are their replacements.
 * @returns The route string with parameters replaced.
 */
export function replaceRouteParams(route: string, params: RouteParams): string {
  return Object.entries(params).reduce((path, [key, value]) => {
    const encodedValue = encodeURIComponent(value?.toString() ?? '');
    const optionalSegment = `/:${key}?`;
    if (encodedValue === '' && path.includes(optionalSegment))
      return path.replace(optionalSegment, '');
    return path.replace(`:${key}?`, encodedValue).replace(`:${key}`, encodedValue);
  }, route);
}
