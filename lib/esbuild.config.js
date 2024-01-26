import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { build, context, analyzeMetafile } from 'esbuild';
import * as dotenv from 'dotenv';
import swc from '@swc/core';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SRC = resolve(__dirname, 'src');

dotenv.config({
  path: `${ROOT}/.env`
});

const BUILD = process.env.BUILD || 'production';
const DEBUG = process.env.DEBUG === 'true';
const WATCH = process.env.WATCH === 'true';
const SENTRY = process.env.SENTRY_DSN_TOKEN || '__DSN__';

const config = {
  /* Setup */
  bundle: true,
  entryPoints: [resolve(SRC, 'index.ts')],
  external: ['@hcaptcha/types'],
  tsconfig: 'tsconfig.json',
  define: {
    'process.env.SENTRY_DSN_TOKEN': JSON.stringify(SENTRY),

  },

  /* Output */
  minify: true,

  /* CI */
  color: true,
  allowOverwrite: true,
  logLevel: 'info',

  /* Source Maps */
  metafile: DEBUG,
  sourcemap: BUILD === 'development',
};

const swcOptions = {
  minify: true,
  sourceMaps: true,
  jsc: {
    target: 'es3',
  },
};


if (WATCH) {
  const ctx = await context({
    ...config,
    format: 'esm',
    outfile: resolve(DIST, 'index.mjs'),
    treeShaking: true,
  });
  await ctx.watch();
} else {
  // Transpile TypeScript to ESM
  const resultESM = await build({
    ...config,
    format: 'esm',
    outfile: resolve(DIST, 'index.js'),
    treeShaking: true,
  });

  // Transpile TypeScript to CommonJS
  const resultCJS = await build({
    ...config,
    format: 'cjs',
    outfile: resolve(DIST, 'index.cjs'),
    treeShaking: true,
  });

  // Transform ESM to ES3
  const resultES3 = await swc.transformFile(resolve(DIST, 'index.js'), swcOptions);
  await fs.writeFile(resolve(DIST, 'index.mjs'), resultES3.code, 'utf-8');
  await fs.writeFile(resolve(DIST, 'index.mjs.map'), resultES3.map, 'utf-8');

  if (DEBUG) {
    const analyzeESM = await analyzeMetafile(resultESM.metafile, {
      verbose: false
    });
    const analyzeCJS = await analyzeMetafile(resultCJS.metafile, {
      verbose: false
    });

    console.log(analyzeESM);
    console.log(analyzeCJS);
  }
}
