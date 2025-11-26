import { BrowserContext, DeviceContext } from './types';
import { SENTRY_TAG, SentryContext } from './constants';

export function generateQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => value || value === false)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    }).join('&');
}

export function getFrame(element?: Element) {
  const doc: any = (element && element.ownerDocument) || document;
  const win = doc.defaultView || doc.parentWindow || window;

  return { document: doc, window: win };
}

export function getMountElement(element?: Element) {
  return element || document.head;
}

export function setContext(scope): void {
  scope.setTag('source', SENTRY_TAG);
  scope.setTag('url', document.URL);

  scope.setContext('os', {
    UA: navigator.userAgent,
  });

  scope.setContext('browser', {
    ...getBrowser(),
  });
  scope.setContext('device', {
    ...getDevice(),
    screen_width_pixels: screen.width,
    screen_height_pixels: screen.height,
    language: navigator.language,
    orientation: screen.orientation?.type || SentryContext.UNKNOWN,
    processor_count: navigator.hardwareConcurrency,
    platform: navigator.platform,
  });
}

function getBrowser(): BrowserContext {
  const userAgent = navigator.userAgent;
  let name, version;

  if (userAgent.indexOf('Firefox') !== -1) {
    name = SentryContext.FIREFOX;
    version = userAgent.match(/Firefox\/([\d.]+)/)?.[1];
  } else if (userAgent.indexOf('Edg') !== -1) {
    name = SentryContext.EDGE;
    version = userAgent.match(/Edg\/([\d.]+)/)?.[1];
  } else if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Safari') !== -1) {
    name = SentryContext.CHROME;
    version = userAgent.match(/Chrome\/([\d.]+)/)?.[1];
  } else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
    name = SentryContext.SAFARI;
    version = userAgent.match(/Version\/([\d.]+)/)?.[1];
  } else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
    name = SentryContext.OPERA;
    version = userAgent.match(/(Opera|OPR)\/([\d.]+)/)?.[2];
  } else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) {
    name = SentryContext.IE;
    version = userAgent.match(/(MSIE |rv:)([\d.]+)/)?.[2];
  } else {
    name = SentryContext.UNKNOWN;
    version = SentryContext.UNKNOWN;
  }

  return { name, version };
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getDevice(): DeviceContext {
  const userAgent = navigator.userAgent;

  let model;
  if (userAgent.indexOf('Win') !== -1) {
    model = SentryContext.WINDOWS;

  } else if (userAgent.indexOf(SentryContext.MAC) !== -1) {
    model = SentryContext.MAC;
  } else if (userAgent.indexOf(SentryContext.LINUX) !== -1) {
    model = SentryContext.LINUX;
  } else if (userAgent.indexOf(SentryContext.ANDROID) !== -1) {
    model = SentryContext.ANDROID;
  } else if (
    userAgent.indexOf('like Mac') !== -1 ||
    userAgent.indexOf('iPhone') !== -1 ||
    userAgent.indexOf('iPad') !== -1
  ) {
    model = SentryContext.IOS;
  } else {
    model = SentryContext.UNKNOWN;
  }

  let device;
  if (/Mobile|iPhone|iPod|Android/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }

  return { model, family: model, device };
}
