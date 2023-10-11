## MAINTENANCE
The below document outlines steps to develop and deploy the hCaptcha loader library.

#### Requirements:
1. NodeJS v18.16+
2. PNPM v8.0+

#### Installation & Setup
1.Install packages by running `pnpm install`
2.In separate tabs, running the following:
  - `pnpm run dev:lib`
  - `pnpm run display:demo`


### Scripts

* `pnpm run build:lib`: Builds distributed version
* `pnpm run dev:lib`: Creates watcher that rebuilds library when a change occurs
* `pnpm run display:demo`: Starts server and opens demo page
* `pnpm run fix:lint`: Fixes lint issues that are automatically solvable
* `pnpm run test:lint`: Runs lint checking
* `pnpm run test:type`: Runs type checking
* `pnpm run test:unit`: Runs unit tests in @loader/lib
* `pnpm run test:integration`: Runs integrations tests with playwright

### Publishing
To publish a new version, follow the next steps:

- Bump the version in package.json
- Create Pull Request for approval
- Merge to main branch
- Create a Github Release with version number specified in package.json
  - Workflow will be triggered, deploying code to [npm @hcaptcha/loader](https://www.npmjs.com/package/@hcaptcha/loader).