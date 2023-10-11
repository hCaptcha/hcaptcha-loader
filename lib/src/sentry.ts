import * as Sentry from '@sentry/browser';

const SENTRY_DSN = process.env.SENTRY_DSN_TOKEN;

let hub = null;

export function initSentry(sentry: boolean) {

  // Sentry disabled in params
  if (sentry === false) {
    return;
  }

  // Client was already created
  if (hub) {
    return hub;
  }

  const client = new Sentry.BrowserClient({
    dsn: SENTRY_DSN,
    transport: Sentry.makeFetchTransport,
    stackParser: Sentry.defaultStackParser,
    integrations: [
      new Sentry.Breadcrumbs(),
      new Sentry.GlobalHandlers(),
      new Sentry.LinkedErrors(),
      new Sentry.Dedupe(),
      new Sentry.HttpContext(),
      new Sentry.BrowserTracing(),
    ],
  });

  hub = new Sentry.Hub(client);
  return hub;
}

export function getSentry() {
  return hub;
}
