# Duckduckgo Auto Themer

Although [duckduckgo.com](duckduckgo.com) by default changes its theme automatically in response to the color scheme of the browser (which may also mirror the user's operating system), currently we don't have the option to configure which light theme and dark theme to be applied, respectively. For example the default "Dark" one maybe a little bit hard to read compared to "Terminal".

This Web Extension enables finer configuration. You can pick 2 different themes to have them applied appropriately. More advanced options (supported by Duckduckgo) can also be set for each of them.

![Duck](./preview/setting.webp)

## Building

Install [PNPM](https://pnpm.io/). Then execute:

```bash
pnpm install
pnpm build
```

Run using [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/):

```bash
web-ext run -s extension/
```
