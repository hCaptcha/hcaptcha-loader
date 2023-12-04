# hCaptcha Loader

This is a JavaScript library to easily configure the loading of the [hCaptcha](https://www.hcaptcha.com) JS client SDK with built-in error handling. It also includes a retry mechanism that will attempt to load the hCaptcha script several times in the event if fails to load due to a network or unforeseen issue.

> [hCaptcha](https://www.hcaptcha.com) is a drop-replacement for reCAPTCHA that protects user privacy.
>
> Sign up at [hCaptcha](https://www.hcaptcha.com) to get your sitekey today. **You need a sitekey to use this library.**

1. [Installation](#installation)
2. [Implementation](#implementation)
3. [Props](#props)

### Installation
```
npm install @hcaptcha/loader
```

### Implementation

```js
import { hCaptchaLoader } from '@hcaptcha/loader';

await hCaptchaLoader();

hcaptcha.render({
  sitekey: '<your_sitekey>'
});

const { response } = await hcaptcha.execute({ async: true });
```

### Props
| Name              | Values/Type | Required | Default         | Description                                                                                                                                               |
|-------------------|-------------|----------|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `loadAsync`       | Boolean     | No       | `true`          | Set if the script should be loaded asynchronously.                                                                                                        |
| `cleanup`         | Boolean     | No       | `true`          | Remove script tag after setup.                                                                                                                            |
| `crossOrigin`     | String      | No       | `-`             | Set script cross origin attribute such as "anonymous".                                                                                                    |
| `scriptLocation`  | HTMLElement | No       | `document.head` | Location of where to append the script tag. Make sure to add it to an area that will persist to prevent loading multiple times in the same document view. |
| `apihost`         | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `assethost`       | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `endpoint`        | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `hl`              | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `host`            | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `imghost`         | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `recaptchacompat` | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `reportapi`       | String      | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `sentry`          | Boolean     | No       | `-`             | See enterprise docs.                                                                                                                                      |
| `custom`          | Boolean     | No       | `-`             | See enterprise docs.                                                                                                                                      |
