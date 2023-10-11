# Lib
This folder contains all of the source code for @hcaptcha/loader, along with testing.

Installation
> pnpm add @loader/lib


#### Scripts

* `pnpm run compile:build`: Builds distributed version
* `pnpm run compile:build`: Builds distributed version in watch mode
* `pnpm run fix:lint`: Fixes lint issues that are automatically solvable
* `pnpm run test:lint`: Runs lint checking
* `pnpm run test:type`: Runs type checking


#### Publishing

To publish a new version, follow the next steps:
1. Bump the version in `package.json`
2. Create a [Github Release](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/managing-releases-in-a-repository#creating-a-release) with version from step 1 **without** a prefix such as `v` (e.g. `1.0.3`)
  * `publish` workflow will be triggered which will: build, test and deploy the package to the [npm @hcaptcha/loader](https://www.npmjs.com/package/@hcaptcha/loader).