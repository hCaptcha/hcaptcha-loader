import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

import { hCaptchaLoader } from '@hcaptcha/loader';
import hCaptchaLoaderSource from '@hcaptcha/loader/source';

const require = createRequire(import.meta.url);
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
