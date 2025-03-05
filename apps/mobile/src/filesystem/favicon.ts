import * as FileSystem from 'expo-file-system';

export function getFaviconPath(hostname: string) {
  return `${FileSystem.documentDirectory}${hostname}_favicon.png`;
}

export async function getFaviconAndSave(hostname: string) {
  try {
    const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;

    // Define the file path
    const fileUri = getFaviconPath(hostname);

    // Check if file already exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    // Download and save the image
    const downloadResumable = FileSystem.createDownloadResumable(faviconUrl, fileUri);
    const result = await downloadResumable.downloadAsync();
    if (result?.uri) return result.uri;

    return null;
  } catch {
    // TODO: handle error?
    return null;
  }
}
