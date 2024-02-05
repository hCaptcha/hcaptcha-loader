import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { build, context, analyzeMetafile } from 'esbuild';
import * as dotenv from 'dotenv';
import swc from '@swc/core';

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
    target: 'es5',
  },
};


if (WATCH) {
  const ctx = await context({
    ...config,
    format: 'esm',
    outfile: resolve(DIST, 'index.mjs'),
    treeShaking: true,
    target: [
      'es6'
    ]
  });
  await ctx.watch();
} else {
  // Transpile TypeScript to ESM
  const resultESM = await build({
    ...config,
    format: 'esm',
    outfile: resolve(DIST, 'index.mjs'),
    treeShaking: true,
    target: [
      'es6'
    ]
  });

  // Transpile TypeScript to CommonJS
  const resultCJS = await build({
    ...config,
    format: 'cjs',
    outfile: resolve(DIST, 'index.cjs'),
    treeShaking: true,
  });

  // Transform to ES5
  const transformedESM = await swc.transformFile(resolve(DIST, 'index.mjs'), swcOptions);

  // Build ES5 bundle
  const resultES5 = await build({
    ...config,
    entryPoints: undefined,
    format: 'iife',
    globalName: 'hCaptcha',
    stdin: {
      contents: transformedESM.code,
      resolveDir: DIST,
      sourcefile: 'index.es5.js',
    },
    outfile: resolve(DIST, 'index.es5.js'),
    treeShaking: true,
    target: [
      'es5',
    ]
  });

  // Add Polyfills
  await build({
    ...config,
    entryPoints: [resolve(SRC, '../polyfills.js')],
    format: 'cjs',
    outfile: resolve(DIST, 'polyfills.js'),
    treeShaking: true,
  });

  if (DEBUG) {
    const analyzeESM = await analyzeMetafile(resultESM.metafile, {
      verbose: false
    });
    const analyzeCJS = await analyzeMetafile(resultCJS.metafile, {
      verbose: false
    });
    const analyzeES5 = await analyzeMetafile(resultES5.metafile, {
      verbose: false
    });

    console.log(analyzeESM);
    console.log(analyzeCJS);
    console.log(analyzeES5);
  }
}
