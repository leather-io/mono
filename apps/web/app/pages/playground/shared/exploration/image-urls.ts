// import.meta.glob needs a literal pattern, so the glob call stays in the area.
export function imageUrls(files: Record<string, string>) {
  const urls: Record<string, string> = {};
  for (const [file, url] of Object.entries(files)) urls[file.split('/').pop() ?? file] = url;
  return urls;
}
