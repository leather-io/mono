// Images an area imports from its own folder (today's captures, references).
// Vite turns each file into a served URL, so nothing goes in apps/web/public:
//
//   const files = import.meta.glob<string>('../references/*.{png,jpg}', {
//     eager: true,
//     query: '?url',
//     import: 'default',
//   });
//   const references = imageUrls(files);
//   … image: references['xverse-1.png'] …
//
// import.meta.glob needs a literal pattern, so the glob call stays in the area.
export function imageUrls(files: Record<string, string>) {
  const urls: Record<string, string> = {};
  for (const [file, url] of Object.entries(files)) urls[file.split('/').pop() ?? file] = url;
  return urls;
}
