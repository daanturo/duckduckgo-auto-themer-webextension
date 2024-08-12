import * as shared from "./shared";
import { browser, storageGetSyncOrManaged } from "./shared";

async function getActiveTab(url) {
  return await browser.tabs.query({
    active: true,
    currentWindow: true,
    url: url,
  });
}

async function querySystemColorSchemeSyncOrAsyncContentScript(tab, callback) {
  const color_scheme = shared.getSystemColorScheme();
  if (color_scheme) {
    return callback({ color_scheme: color_scheme });
  } else {
    return await browser.tabs
      .sendMessage(tab.id, { url: tab.url })
      .then(callback);
  }
}

async function cookieUpdate() {
  return await getActiveTab(
    browser.runtime.getManifest().host_permissions,
  ).then(async function (tabs) {
    if (tabs.length === 0) return;
    const url = tabs[0].url;

    // Chromium's service worker can't use window.matchMedia, while content
    // scripts can't set cookies. So at least for Firefox, try to use
    // synchronous matchMedia to apply theme as soon as possible.
    return await querySystemColorSchemeSyncOrAsyncContentScript(
      tabs[0],
      function ({ color_scheme }) {
        const color_scheme_theme_key = color_scheme + "-theme";
        storageGetSyncOrManaged([
          "light-theme",
          "dark-theme",
          "shared-options",
          "light-options",
          "dark-options",
        ]).then(function (result) {
          if (color_scheme) {
            const theme_name =
              result[color_scheme_theme_key] ||
              shared.EXT_DEFAULT_THEME[color_scheme];
            const theme_cookie = {
              url: url,
              name: shared.THEME_KEY,
              value: shared.THEME_TABLE[theme_name]["cookie-value"],
            };
            browser.cookies.set(theme_cookie);
          }

          if (result["shared-options"]) {
            shared.setCookiesForSettings(result["shared-options"], url);
          } else {
            browser.cookies.getAll({}).then(function (cookies_arr) {
              shared.setCookiesForSettings(
                shared.EXT_DEFAULT_SHARED_OPTIONS,
                url,
                {
                  exclude_names: cookies_arr.map((cookie) => cookie["name"]),
                },
              );
            });
          }

          if (color_scheme === "light") {
            shared.setCookiesForSettings(result["light-options"], url);
          }
          if (color_scheme === "dark") {
            shared.setCookiesForSettings(result["dark-options"], url);
          }
        });
      },
    );
  });
}

// update when the tab is updated
browser.tabs.onUpdated.addListener(cookieUpdate);
