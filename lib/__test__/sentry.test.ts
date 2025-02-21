import { describe, it, jest, expect, afterEach } from '@jest/globals';
import { Sentry } from '@hcaptcha/sentry';

import { initSentry } from '../src/sentry';

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

describe('Sentry', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Sentry Hub and return wrapper', () => {
    const wrapper = initSentry(true);

    expect(Sentry.init).toHaveBeenCalledTimes(1);
    expect(Sentry.scope.setTag).toHaveBeenCalledTimes(2);
    expect(Sentry.scope.setContext).toHaveBeenCalledTimes(3);

    expect(wrapper).toBeTruthy();
  });

  it('should initialize sentry and call api', () => {
    const wrapper = initSentry(true);

    wrapper.addBreadcrumb({ category: 'test' });
    wrapper.captureRequest({ method: 'GET', url: 'test' });
    wrapper.captureException('test error');

    expect(Sentry.init).toHaveBeenCalledTimes(1);
    expect(Sentry.scope.addBreadcrumb).toHaveBeenCalledTimes(1);
    expect(Sentry.scope.setRequest).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);

    expect(wrapper).toBeTruthy();
  });


  it('should not throw when Sentry is false', () => {
    const wrapper = initSentry(false);

    const testWrapperCall = () => {
      wrapper.addBreadcrumb({ category: 'test' });
      wrapper.captureException('test error');
    };

    expect(testWrapperCall).not.toThrow();
  });

});

