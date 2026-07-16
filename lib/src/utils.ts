import { BrowserContext, DeviceContext, OperatingSystemContext } from './types';
import { SENTRY_TAG, SentryContext } from './constants';

const ANDROID_WEBVIEW_PATTERNS = [
  /Version\/.+Chrome\/(\d+)\.(\d+)\.(\d+)\.(\d+)/,
  /;\s*wv\).+Chrome\/(\d+)\.(\d+)\.(\d+)\.(\d+)/,
];
const ANDROID_OS_PATTERNS = [
  /Android[ \-/](\d+)(?:\.(\d+)|)(?:[.-]([a-z0-9]+)|)/i,
];
const IOS_OS_PATTERNS = [
  /(?:CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(\d+)[_.](\d+)(?:[_.](\d+)|)/,
  /\b(?:iOS[ /]|iOS; |iPhone(?:\/| v|[ _]OS[/,]|; | OS : |\d,\d\/|\d,\d; )|iPad\/)(\d{1,2})[_.](\d{1,2})(?:[_.](\d+)|)/,
];
const IOS_BROWSER_PATTERN = /(?:CriOS|FxiOS|OPiOS|EdgiOS|UCBrowser|Puffin)\//;

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
  const userAgent = navigator.userAgent;

  scope.setTag('source', SENTRY_TAG);
  scope.setTag('url', document.URL);

  scope.setContext('os', {
    ...getMobileOperatingSystem(userAgent),
    UA: userAgent,
  });

  scope.setContext('browser', {
    ...getBrowser(userAgent),
  });
  scope.setContext('device', {
    ...getDevice(userAgent),
    screen_width_pixels: screen.width,
    screen_height_pixels: screen.height,
    language: navigator.language,
    orientation: screen.orientation?.type || SentryContext.UNKNOWN,
    processor_count: navigator.hardwareConcurrency,
    platform: navigator.platform,
  });
}

function getBrowser(userAgent: string): BrowserContext {
  let name, version;
  const androidWebViewVersion = userAgent.indexOf(SentryContext.ANDROID) !== -1
    ? findVersion(userAgent, ANDROID_WEBVIEW_PATTERNS)
    : undefined;

  if (userAgent.indexOf('Firefox') !== -1) {
    name = SentryContext.FIREFOX;
    version = userAgent.match(/Firefox\/([\d.]+)/)?.[1];
  } else if (userAgent.indexOf('Edg') !== -1) {
    name = SentryContext.EDGE;
    version = userAgent.match(/Edg\/([\d.]+)/)?.[1];
  } else if (androidWebViewVersion) {
    name = SentryContext.ANDROID_WEBVIEW;
    version = androidWebViewVersion;
  } else if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Safari') !== -1) {
    name = SentryContext.CHROME;
    version = userAgent.match(/Chrome\/([\d.]+)/)?.[1];
  } else if (isIOSWebView(userAgent)) {
    name = SentryContext.IOS_WEBVIEW;
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

  const context: BrowserContext = { name };
  if (version) {
    context.version = version;
  }

  return context;
}

function getMobileOperatingSystem(userAgent: string): Partial<OperatingSystemContext> {
  if (userAgent.indexOf('Windows Phone') !== -1 || userAgent.indexOf('Windows Mobile') !== -1) {
    return {};
  }

  if (userAgent.indexOf(SentryContext.ANDROID) !== -1) {
    return buildOperatingSystemContext(SentryContext.ANDROID, findVersion(userAgent, ANDROID_OS_PATTERNS));
  } else if (isIOS(userAgent)) {
    return buildOperatingSystemContext(SentryContext.IOS, findVersion(userAgent, IOS_OS_PATTERNS));
  }

  return {};
}

function buildOperatingSystemContext(name: string, version?: string): OperatingSystemContext {
  const context: OperatingSystemContext = { name };
  if (version) {
    context.version = version;
  }

  return context;
}

function findVersion(userAgent: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(userAgent);
    if (match) {
      return match.slice(1).filter(Boolean).join('.');
    }
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getDevice(userAgent: string): DeviceContext {
  let model;
  if (userAgent.indexOf('Win') !== -1) {
    model = SentryContext.WINDOWS;
  } else if (isIPhone(userAgent)) {
    model = SentryContext.IPHONE;
  } else if (isIPad(userAgent)) {
    model = SentryContext.IPAD;
  } else if (isIPod(userAgent)) {
    model = SentryContext.IPOD;
  } else if (userAgent.indexOf(SentryContext.ANDROID) !== -1) {
    model = SentryContext.ANDROID;
  } else if (userAgent.indexOf(SentryContext.MAC) !== -1) {
    model = SentryContext.MAC;
  } else if (userAgent.indexOf(SentryContext.LINUX) !== -1) {
    model = SentryContext.LINUX;
  } else {
    model = SentryContext.UNKNOWN;
  }

  let device;
  if (isIPad(userAgent) || /Tablet/i.test(userAgent)) {
    device = 'Tablet';
  } else if (/Mobile|iPhone|iPod|Android/i.test(userAgent)) {
    device = 'Mobile';
  } else {
    device = 'Desktop';
  }

  return { model, family: model, device };
}

function isIOSWebView(userAgent: string): boolean {
  return isIOS(userAgent) &&
    userAgent.indexOf('AppleWebKit') !== -1 &&
    userAgent.indexOf('Safari') === -1 &&
    !IOS_BROWSER_PATTERN.test(userAgent);
}

function isIOS(userAgent: string): boolean {
  return isIPhone(userAgent) || isIPad(userAgent) || isIPod(userAgent);
}

function isIPhone(userAgent: string): boolean {
  return /iPhone(?:;|\/)/.test(userAgent);
}

function isIPad(userAgent: string): boolean {
  return /iPad(?:;|\/)/.test(userAgent);
}

function isIPod(userAgent: string): boolean {
  return /iPod(?: touch)?(?:;|\/)/.test(userAgent);
}
