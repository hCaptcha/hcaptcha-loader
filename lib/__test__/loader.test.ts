import { afterEach, afterAll, beforeAll, describe, it, jest, expect } from '@jest/globals';
import { waitFor } from '@testing-library/dom';

import { fetchScript } from "../src/script";
import { hCaptchaLoader, hCaptchaScripts } from "../src/loader";
import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_COMPLETE, SCRIPT_ERROR} from "../src/constants";

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
          window.hcaptcha = 'hcaptcha-test';
      })

      afterEach(() => {
        jest.resetAllMocks();
      });

      afterAll(() => {
        cleanupScripts();
      })

      it('should fetch script by default', async () => {
          mockFetchScript.mockResolvedValueOnce(SCRIPT_COMPLETE);

          const promise = hCaptchaLoader({ sentry: false });

          await waitFor(() => {
              expect(mockFetchScript).toHaveBeenCalled();

              // Trigger script onload callback to resolve promise
              window[HCAPTCHA_LOAD_FN_NAME]();
              expect(promise).resolves.toEqual(window.hcaptcha);
          });
      });

      it('should not fetch script since it was already loaded', async () => {
          const result = await hCaptchaLoader({ sentry: false });
          expect(result).toEqual(window.hcaptcha);
          expect(mockFetchScript).not.toHaveBeenCalled();
      });

    });

    describe('script error', () => {

      afterEach(() => {
        cleanupScripts();
      })

      it('should reject with script-error when error while loading occurs', async () => {
        mockFetchScript.mockRejectedValueOnce(SCRIPT_ERROR);

        try {
          await hCaptchaLoader({ sentry: false });
        } catch(error) {
          expect(error.message).toEqual(SCRIPT_ERROR)
        }
      });

    });

});
