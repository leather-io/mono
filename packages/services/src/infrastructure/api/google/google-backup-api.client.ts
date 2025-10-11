import { GoogleDriveBackupEntry } from '@leather.io/models';

import { buildMultipartBody, googleApiRequest } from './api-utils';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export class GoogleDriveClient {
  constructor(private readonly token: string) {}

  async findFileByName(name: string): Promise<GoogleDriveBackupEntry | null> {
    const data = await googleApiRequest<{ files?: GoogleDriveBackupEntry[] }>(
      DRIVE_API_BASE,
      'files',
      {
        token: this.token,
        query: {
          spaces: 'appDataFolder',
          q: `name='${name}'`,
          fields: 'files(id, name, appProperties, properties)',
        },
      }
    );
    return data.files?.[0] ?? null;
  }

  async list(): Promise<GoogleDriveBackupEntry[]> {
    const data = await googleApiRequest<{ files?: GoogleDriveBackupEntry[] }>(
      DRIVE_API_BASE,
      'files',
      {
        token: this.token,
        query: { spaces: 'appDataFolder', fields: 'files(id, name, appProperties, properties)' },
      }
    );
    return data.files ?? [];
  }

  async upload(
    name: string,
    content: object,
    appProperties?: Record<string, string | null | undefined>
  ) {
    const existing = await this.findFileByName(name);
    const metadata = {
      name,
      parents: ['appDataFolder'],
      ...(appProperties ? { appProperties } : {}),
    };
    const { body, contentType } = buildMultipartBody(metadata, content);

    const method = existing ? 'PATCH' : 'POST';
    const endpoint = existing ? `files/${existing.id}` : 'files';

    return googleApiRequest(DRIVE_UPLOAD_BASE, endpoint, {
      method,
      token: this.token,
      query: { uploadType: 'multipart' },
      headers: { 'Content-Type': contentType },
      body,
    });
  }

  async download<T = any>(name: string): Promise<T> {
    const file = await this.findFileByName(name);
    if (!file) throw new Error(`File "${name}" not found`);

    const res = await fetch(`${DRIVE_API_BASE}/files/${file.id}?alt=media`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!res.ok) throw new Error(`Download failed: ${res.status} ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  async delete(name: string) {
    const file = await this.findFileByName(name);
    if (!file) return { success: true };

    await googleApiRequest(DRIVE_API_BASE, `files/${file.id}`, {
      method: 'DELETE',
      token: this.token,
    });
    return { success: true };
  }

  async updateMetadata(fileId: string, metadata: any) {
    return googleApiRequest(DRIVE_API_BASE, `files/${fileId}`, {
      method: 'PATCH',
      token: this.token,
      body: JSON.stringify(metadata),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
