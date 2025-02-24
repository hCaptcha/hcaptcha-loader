import { afterEach, afterAll, beforeAll, describe, it, jest, expect } from '@jest/globals';
import { waitFor } from '@testing-library/dom';

import { fetchScript } from '../src/script';
import { hCaptchaLoader, hCaptchaScripts } from '../src/loader';
import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_COMPLETE, SCRIPT_ERROR } from '../src/constants';

jest.mock('@hcaptcha/sentry', () => ({
  Sentry: {
    init: jest.fn(),
    captureException: jest.fn(),
    scope: {
      addBreadcrumb: jest.fn(),
      setTag: jest.fn(),
      setContext: jest.fn(),
      setRequest: jest.fn(),
    },
  },
}));

jest.mock('../src/script');

const mockFetchScript = fetchScript as jest.MockedFunction<typeof fetchScript>;

function cleanupScripts() {
  let i = hCaptchaScripts.length;
  while (--i > -1) {
    hCaptchaScripts.splice(i, 1);
  }
}

describe('hCaptchaLoader', () => {

  describe('script success', () => {

    beforeAll(() => {
      (window as any).hcaptcha = 'hcaptcha-test';
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    afterAll(() => {
      cleanupScripts();
    });

    it('should fetch script by default', async () => {
      mockFetchScript.mockResolvedValueOnce(SCRIPT_COMPLETE);

      const promise = hCaptchaLoader({ sentry: false });

      await waitFor(() => {
        expect(mockFetchScript).toHaveBeenCalledTimes(1);

        // Trigger script onload callback to resolve promise
        window[HCAPTCHA_LOAD_FN_NAME]();
        expect(promise).resolves.toEqual((window as any).hcaptcha);
      });
    });

    it('should not fetch script since it was already loaded', async () => {
      const result = await hCaptchaLoader({ sentry: false });
      expect(result).toEqual((window as any).hcaptcha);
      expect(mockFetchScript).not.toHaveBeenCalled();
    });
  });

  describe('script retry', () => {

    beforeAll(() => {
      (window as any).hcaptcha = 'hcaptcha-test';
    });

    afterEach(() => {
      jest.resetAllMocks();
      cleanupScripts();
    });

    it('should retry and load after fetch script error', async () => {
      mockFetchScript.mockRejectedValueOnce(SCRIPT_ERROR);
      mockFetchScript.mockResolvedValueOnce(SCRIPT_COMPLETE);

      const promise = hCaptchaLoader({ sentry: false });

      await waitFor(() => {
        expect(mockFetchScript).toHaveBeenCalledTimes(2);

        // Trigger script onload callback to resolve promise
        window[HCAPTCHA_LOAD_FN_NAME]();
        expect(promise).resolves.toEqual((window as any).hcaptcha);
      });
    });

    it('should try loading 2 times and succeed on final try', async () => {
      mockFetchScript.mockRejectedValueOnce(SCRIPT_ERROR);
      mockFetchScript.mockRejectedValueOnce(SCRIPT_ERROR);
      mockFetchScript.mockResolvedValueOnce(SCRIPT_COMPLETE);

      const promise = hCaptchaLoader({ sentry: false });

      await waitFor(() => {
        expect(mockFetchScript).toHaveBeenCalledTimes(3);

        // Trigger script onload callback to resolve promise
        window[HCAPTCHA_LOAD_FN_NAME]();
        expect(promise).resolves.toEqual((window as any).hcaptcha);
      });
    });

    it('should try loading 3 times and throw', async () => {
      mockFetchScript.mockRejectedValue('test error');

      try {
        await hCaptchaLoader({ sentry: false, cleanup: true });
      } catch (error) {
        expect(mockFetchScript).toBeCalledTimes(3);
        expect(error.message).toBe(SCRIPT_ERROR);
      }
    });
  });

  describe('script error', () => {

    afterEach(() => {
      cleanupScripts();
      jest.resetAllMocks();
    });

    it('should reject with script-error when error while loading occurs', async () => {
      mockFetchScript.mockRejectedValue(SCRIPT_ERROR);

      try {
        await hCaptchaLoader({ sentry: false });
      } catch(error) {
        expect(error.message).toEqual(SCRIPT_ERROR);
      }
    });

  });

});
