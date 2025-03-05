function generateUUID() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Format it as a UUID (RFC 4122 version 4)
  return [...array]
    .map((b, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + (b % 16).toString(16))
    .join('');
}

// polyfill crypto.randomUUID
crypto.randomUUID = crypto.randomUUID ?? generateUUID;
