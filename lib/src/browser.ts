import { hCaptchaLoader } from './loader';

import type { ILoaderParams } from './types.js';

declare global {
  interface Window {
    hCaptchaLoader: (params?: ILoaderParams) => Promise<any>;
  }
}

window.hCaptchaLoader = hCaptchaLoader;
