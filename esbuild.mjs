import 'dotenv/config';

import { build } from 'esbuild';
import { environmentPlugin } from 'esbuild-plugin-environment';

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  console.error('Invalid environment configuration provided');
  process.exit(1);
}

await build({
  entryPoints: ['index.ts'],
  outfile: 'dist/my-cli.js',
  platform: 'node',
  bundle: true,
  plugins: [
    environmentPlugin({
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    }),
  ],

  // ref: https://github.com/sindresorhus/open/issues/330#issuecomment-2047513034
  define: { 'import.meta.url': '_importMetaUrl' },
  banner: {
    js: "const _importMetaUrl=require('url').pathToFileURL(__filename)",
  },
}).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
