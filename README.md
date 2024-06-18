# Embed Connect JavaScript SDK

This SDK makes it easy to connect end-user accounts to integrations like Dropbox, Slack, HubSpot, and more. For a detailed overview of the auth flow, refer to [the docs](https://docs.useembed.com/). If you're using React (or a React-based framework like Next.js), consider using the [React SDK](https://github.com/embedhq/embed-react) instead.

[![npm latest package](https://img.shields.io/npm/v/@embedhq/js/latest.svg)](https://www.npmjs.com/package/@embedhq/js)

[**Visit the Embed website ▸**](https://useembed.com/)

[**Read the documentation ▸**](https://docs.useembed.com/)

[**View the API reference ▸**](https://docs.useembed.com/api-reference)

## Installation

Download the SDK from NPM.

```bash
npm install @embedhq/js
```

## Usage

First, generate a [session token](https://docs.useembed.com/guides/step-by-step-guides/auth-flow) server-side, then use it to call the `connect()` function as shown below.

```js
import { Embed } from "@embedhq/js";

const embed = new Embed();

embed
  .connect("SESSION_TOKEN")
  .then((res) => console.log(res.connectionId))
  .catch((err) => console.error(err));
```
