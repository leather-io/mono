export function json<T>(data: T): { contentType: string; body: string } {
  return {
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

export async function delayedJson<T>(data: T, delayMs = 400): Promise<{ contentType: string; body: string }> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return json(data);
}
