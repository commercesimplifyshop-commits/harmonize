import { del, put } from '@vercel/blob';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { config } from '../config';

export type Stored = { url: string; key: string };

/** Where uploaded files live. Same interface on Vercel (Blob) and HostGator (local disk). */
export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<Stored>;
  delete(key: string): Promise<void>;
}

/** Files under UPLOAD_DIR, served by the api at /uploads (see app.setup.ts). */
class LocalStorage implements Storage {
  private readonly root = resolve(config.uploadDir);

  async put(key: string, body: Buffer): Promise<Stored> {
    const path = join(this.root, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
    return { url: `/uploads/${key}`, key };
  }

  async delete(key: string) {
    await unlink(join(this.root, key)).catch(() => undefined);
  }
}

class BlobStorage implements Storage {
  async put(key: string, body: Buffer, contentType: string): Promise<Stored> {
    const blob = await put(key, body, {
      access: 'public',
      contentType,
      token: config.blobToken,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    // Blob URLs are the key: deleting needs the full URL.
    return { url: blob.url, key: blob.url };
  }

  async delete(key: string) {
    await del(key, { token: config.blobToken }).catch(() => undefined);
  }
}

export const storage: Storage = config.storageDriver === 'blob' ? new BlobStorage() : new LocalStorage();
