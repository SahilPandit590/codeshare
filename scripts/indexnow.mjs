import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDEXABLE_ROUTES, SITE_ORIGIN, toAbsoluteUrl } from './public-routes.mjs';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(root, 'frontend', 'public');

export async function findIndexNowKey() {
  const files = await readdir(publicDirectory);
  const candidates = files.filter((file) => /^indexnow-[a-f0-9]{32}\.txt$/i.test(file));
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one IndexNow key file, found ${candidates.length}.`);
  }

  const fileName = candidates[0];
  const key = (await readFile(path.join(publicDirectory, fileName), 'utf8')).trim();
  const fileKey = fileName.slice('indexnow-'.length, -'.txt'.length);
  if (key !== fileKey || !/^[a-f0-9]{32}$/i.test(key)) {
    throw new Error('IndexNow key file name and contents do not match a valid key.');
  }

  return { key, fileName };
}

export function normalizeIndexNowUrls(routes = INDEXABLE_ROUTES) {
  const uniqueRoutes = [...new Set(routes)];
  return uniqueRoutes.map((route) => toAbsoluteUrl(route));
}

export function createIndexNowPayload({ key, keyLocation, urls }) {
  const parsedKeyLocation = new URL(keyLocation);
  const parsedUrls = normalizeIndexNowUrls(urls.map((url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin !== SITE_ORIGIN || parsedUrl.search || parsedUrl.hash) {
      throw new Error(`IndexNow URL must be an absolute canonical URL on ${SITE_ORIGIN}: ${url}`);
    }
    return parsedUrl.pathname;
  }));
  if (parsedKeyLocation.origin !== SITE_ORIGIN || !parsedKeyLocation.pathname.endsWith(`${key}.txt`)) {
    throw new Error('IndexNow key location must belong to the canonical website and contain the key.');
  }
  return {
    host: new URL(SITE_ORIGIN).host,
    key,
    keyLocation,
    urlList: parsedUrls,
  };
}

export async function submitToIndexNow(payload, { fetchImpl = fetch, retries = 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (response.ok) return { status: response.status };
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        const error = new Error(`IndexNow rejected the request with HTTP ${response.status}.`);
        error.retryable = false;
        throw error;
      }
      lastError = new Error(`IndexNow temporarily returned HTTP ${response.status}.`);
    } catch (error) {
      if (error instanceof Error && error.retryable === false) throw error;
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  throw lastError ?? new Error('IndexNow submission failed.');
}

function parseRoutes(argumentsList) {
  const routeArguments = argumentsList.filter((argument) => argument !== '--submit');
  return routeArguments.length > 0 ? routeArguments : INDEXABLE_ROUTES;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { key, fileName } = await findIndexNowKey();
  const routes = parseRoutes(process.argv.slice(2));
  const urls = normalizeIndexNowUrls(routes);
  const payload = createIndexNowPayload({
    key,
    keyLocation: `${SITE_ORIGIN}/${fileName}`,
    urls,
  });

  if (!process.argv.includes('--submit')) {
    console.log(JSON.stringify({ endpoint: INDEXNOW_ENDPOINT, payload }, null, 2));
    console.log('Dry run only. Add --submit to send this notification.');
  } else {
    const result = await submitToIndexNow(payload);
    console.log(`IndexNow accepted ${payload.urlList.length} URL(s) with HTTP ${result.status}.`);
  }
}
