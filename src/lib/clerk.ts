import { Clerk } from '@clerk/clerk-js/headless';
import { readAuthCache, writeAuthCache } from './cache';

global.window = global.window || {};

const clerkFactory = () => {
  let clerkInstance: Clerk;

  return async () => {
    if (clerkInstance) return clerkInstance;

    clerkInstance = new Clerk(process.env.CLERK_PUBLISHABLE_KEY!);

    const fapiClient = clerkInstance.getFapiClient();

    fapiClient.onBeforeRequest(async (requestInit) => {
      requestInit.credentials = 'omit';

      requestInit.url?.searchParams.append('_is_native', '1');

      const creds = await readAuthCache();

      if (creds)
        (requestInit.headers as Headers).set(
          'authorization',
          creds.token,
        );
    });

    fapiClient.onAfterResponse(async (_, response) => {
      const authHeader = response?.headers.get('authorization');

      if (authHeader)
        await writeAuthCache({
          token: authHeader,
          lastAuthenticated: Date.now(),
        });
    });

    await clerkInstance.load({ standardBrowser: false });

    return clerkInstance;
  };
};

export const createClerkClient = clerkFactory();
