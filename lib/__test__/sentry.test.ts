import { describe, it, jest, expect, afterEach } from '@jest/globals';

import * as Sentry from '@sentry/browser';
import {
  initSentry,
  getSentry,
  getSentryHubWrapper,
} from '../src/sentry';
import { SCRIPT_ERROR } from '../src/constants.js';

jest.mock('@sentry/browser', () => ({
  BrowserClient: jest.fn(),
  Hub: jest.fn(),
  Breadcrumbs: jest.fn(),
  GlobalHandlers: jest.fn(),
  LinkedErrors: jest.fn(),
  Dedupe: jest.fn(),
  HttpContext: jest.fn(),
  BrowserTracing: jest.fn(),
  makeFetchTransport: jest.fn(),
  defaultStackParser: jest.fn(),
  withScope: jest.fn(),
}));

const mockScope = {
  setTag: jest.fn(),
};

describe('Sentry', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Sentry Hub and return wrapper', () => {
    const hub = initSentry(true);
    expect(Sentry.BrowserClient).toHaveBeenCalledTimes(1);
    expect(Sentry.Hub).toHaveBeenCalledTimes(1);
    expect(hub).toBeTruthy();
  });

  it('should not throw when Sentry is false', () => {
    const sentryHubWrapper = getSentryHubWrapper(false);

    const testWrapperCall = () => {
      sentryHubWrapper.addBreadcrumb({ category: 'test' });
      sentryHubWrapper.captureMessage('test message');
      sentryHubWrapper.captureException('test error');
    };

    expect(testWrapperCall).not.toThrow();
  });

  it('should get initialized Sentry Hub', () => {
    const hub = initSentry(true);
    const hubValues = String(Object.values(hub));

    const retrievedHub = getSentry();
    const retrievedValues = String(Object.values(retrievedHub));

    expect(hubValues).toEqual(retrievedValues);
  });

  it('should wrap Sentry Hub correctly', () => {
    const mockHub = {
      addBreadcrumb: jest.fn(),
      captureMessage: jest.fn(),
      captureEvent: jest.fn(),
      withScope: jest.fn(callback => callback(mockScope)),
    };

    const tag = { key: 'testKey', value: 'testValue' };
    const breadcrumb = { category: 'test' };

    const sentryHubWrapper = getSentryHubWrapper(mockHub, tag);

    sentryHubWrapper.addBreadcrumb(breadcrumb);
    expect(mockHub.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);

    sentryHubWrapper.captureMessage('test message');
    expect(mockHub.captureMessage).toHaveBeenCalledWith('test message');

    sentryHubWrapper.captureException(new Error('test error'));
    expect(mockHub.captureEvent).toHaveBeenCalledWith({
      message: SCRIPT_ERROR,
      level: 'error',
      extra: new Error('test error'),
    });

    sentryHubWrapper.captureException('test non error');
    expect(mockHub.captureEvent).toHaveBeenCalledWith({
      message: SCRIPT_ERROR,
      level: 'error',
      extra: 'test non error',
    });
  });
});

