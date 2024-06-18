# Embed Connect JavaScript SDK

The Embed Connect SDK makes it easy to connect end-user accounts to integrations like Dropbox, Slack, HubSpot, and more. For a detailed overview of the auth flow, refer to [the docs](https://docs.useembed.com/). If you're using React (or a React-based framework like Next.js), consider using the [React SDK](https://github.com/embedhq/embed-react) instead.

[Embed Website →](https://useembed.com/)<br />
[Embed Documentation →](https://docs.useembed.com/)<br />
[Embed API Reference →](https://docs.useembed.com/api-reference)

## Code example

Initiate secure, white-label auth flows in a few lines of code. First, generate a session token server-side, then use it to call the `connect` function on the client-side.

```js
import { Embed } from "@embedhq/js";

const embed = new Embed();

embed
  .connect("SESSION_TOKEN")
  .then((res) => console.log(res.connectionId))
  .catch((err) => console.error(err));
```
