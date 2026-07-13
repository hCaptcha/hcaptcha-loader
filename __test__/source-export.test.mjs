import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import { hCaptchaLoader } from '@hcaptcha/loader';
import hCaptchaLoaderSource from '@hcaptcha/loader/source';

const require = createRequire(import.meta.url);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredLoader = require('@hcaptcha/loader');
const requiredSource = require('@hcaptcha/loader/source');

test('preserves the existing ESM and CommonJS loader exports', () => {
  assert.equal(typeof hCaptchaLoader, 'function');
  assert.equal(typeof requiredLoader.hCaptchaLoader, 'function');
});

test('exports the same source to ESM and CommonJS consumers', () => {
  assert.equal(typeof hCaptchaLoaderSource, 'string');
  assert.equal(requiredSource, hCaptchaLoaderSource);
});

test('exports source that is safe to embed in a script element', () => {
  assert.doesNotMatch(hCaptchaLoaderSource, /<\/script/i);
});

test('registers hCaptchaLoader on window', () => {
  const context = {
    clearTimeout,
    console,
    setTimeout,
    window: {},
  };

  vm.runInNewContext(hCaptchaLoaderSource, context);

  assert.equal(typeof context.window.hCaptchaLoader, 'function');
});

test('includes every source export artifact in the package', () => {
  const npmCache = mkdtempSync(join(tmpdir(), 'hcaptcha-loader-npm-'));

  try {
    const output = execFileSync(
      'npm',
      ['pack', '--dry-run', '--ignore-scripts', '--json'],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          npm_config_cache: npmCache,
          npm_config_loglevel: 'silent',
        },
      }
    );
    const [{ files }] = JSON.parse(output);
    const packagedFiles = new Set(files.map(({ path }) => path));

    assert.equal(packagedFiles.has('dist/source.cjs'), true);
    assert.equal(packagedFiles.has('dist/source.mjs'), true);
    assert.equal(packagedFiles.has('dist/source.d.ts'), true);
  } finally {
    rmSync(npmCache, { force: true, recursive: true });
  }
});
