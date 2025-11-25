export const SCRIPT_ID = 'hCaptcha-script';
export const HCAPTCHA_LOAD_FN_NAME = 'hCaptchaOnLoad';
export const SCRIPT_ERROR = 'script-error';
export const SCRIPT_COMPLETE = 'script-loaded';

export const SENTRY_TAG = '@hCaptcha/loader';

export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000;

export enum SentryContext {
  ANDROID = 'Android',
  IOS = 'iOS',
  LINUX = 'Linux',
  MAC = 'Mac',
  WINDOWS = 'Windows',
  CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  UNKNOWN = 'Unknown',
  SAFARI = 'Safari',
  OPERA = 'Opera',
  IE = 'Internet Explorer',
  EDGE = 'Microsoft Edge',
}
