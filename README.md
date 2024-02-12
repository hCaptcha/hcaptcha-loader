# hCaptcha Loader

This is a JavaScript library to easily configure the loading of the [hCaptcha](https://www.hcaptcha.com) JS client SDK with built-in error handling. It also includes a retry mechanism that will attempt to load the hCaptcha script several times in the event if fails to load due to a network or unforeseen issue.

> [hCaptcha](https://www.hcaptcha.com) is a drop-replacement for reCAPTCHA that protects user privacy.
>
> Sign up at [hCaptcha](https://www.hcaptcha.com) to get your sitekey today. **You need a sitekey to use this library.**

1. [Installation](#installation)
2. [Implementation](#implementation)
3. [Props](#props)
3. [Legacy Support](#legacy-support)

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



## Legacy Support
In order to support older browsers, a seperate bundle is generated in which all ES6 code is compiled down to ES5 along with an optional polyfill bundle to extend functionality that is used common to modern browsers.

- `polyfills.js`: Provides polyfills for features not supported in older browsers.
- `index.es5.js`: **@hcaptcha/loader** package compiled for ES5 environments.

### Import Bundle(s)
Both bundles generated utilize IIFE format instead of modern importation syntax such as `require` or `esm`.

```js
// Optional polyfill import
import '@hCaptcha/loader/dist/polyfills.js';
// ES5 version of hCaptcha Loader
import '@hCaptcha/loader/dist/index.es5.js';

hCaptchaLoader.then(function() {
    var element = document.createElement('div');
    // hCaptcha API is ready
    hcaptcha.render(element, {
        sitekey: 'YOUR_SITE_KEY',
        // Additional options here
    });
});

```

### CDN
The hCaptcha Loader targetted for older browsers can also be imported via a CDN by leveraging UNPKG](https://www.unpkg.com/), see example below.


```html
<!DOCTYPE html>
<head>
    <script type="text/javascript" src="https://unpkg.com/@hcaptcha/loader@latest/dist/polyfills.js"></script>
    <script type="text/javascript" src="https://unpkg.com/@hcaptcha/loader@latest/dist/index.es5.js"></script>
</head>
<body>
    <script type="text/javascript">
        hCaptchaLoader.then(function() {
            var element = document.createElement('div');
            // hCaptcha API is ready
            hcaptcha.render(element, {
                sitekey: 'YOUR_SITE_KEY',
                // Additional options here
            });
        });
    </script>
</body>
</html>
```
