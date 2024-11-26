import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { cwd } from 'process';

type AuthCache = {
  token: string;
  lastAuthenticated: number;
};

const getAuthCachePath = () => {
  return `${cwd()}/creds.json`;
};

export async function readAuthCache() {
  const cachePath = getAuthCachePath();
  const cacheExists = existsSync(cachePath);

  if (!cacheExists) return null;

  const authCacheConfig = await readFile(getAuthCachePath(), 'utf-8');

  return JSON.parse(authCacheConfig) as AuthCache;
}

export async function writeAuthCache(cache: AuthCache) {
  const configString = JSON.stringify(cache);

  await writeFile(getAuthCachePath(), configString);
}
