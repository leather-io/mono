export function defaultSlugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 96)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
