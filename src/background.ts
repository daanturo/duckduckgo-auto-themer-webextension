import * as shared from "./shared";
import { browser, storageGetSyncOrManaged } from "./shared";

function getActiveTab(url) {
  return browser.tabs.query({ active: true, currentWindow: true, url: url });
}

async function cookieUpdate() {
  getActiveTab(browser.runtime.getManifest().host_permissions).then(
    function (tabs) {
      if (tabs.length === 0) return;
      const tab0_url = tabs[0].url;

      if (window.matchMedia) {
        const color_scheme = shared.getSystemColorScheme();
        const color_scheme_theme_key = color_scheme + "-theme";
        storageGetSyncOrManaged([
          "light-theme",
          "dark-theme",
          "shared-options",
          "light-options",
          "dark-options",
        ]).then(function (result) {
          const theme_name =
            result[color_scheme_theme_key] ||
            shared.EXT_DEFAULT_THEME[color_scheme];
          const theme_cookie = {
            url: tab0_url,
            name: shared.THEME_KEY,
            value: shared.THEME_TABLE[theme_name]["cookie-value"],
          };

          browser.cookies.set(theme_cookie);

          if (result["shared-options"]) {
            shared.setCookiesForSettings(result["shared-options"], tab0_url);
          } else {
            browser.cookies.getAll({}).then(function (cookies_arr) {
              shared.setCookiesForSettings(
                shared.EXT_DEFAULT_SHARED_OPTIONS,
                tab0_url,
                {
                  exclude_names: cookies_arr.map((cookie) => cookie["name"]),
                },
              );
            });
          }

          if (color_scheme === "light") {
            shared.setCookiesForSettings(result["light-options"], tab0_url);
          }
          if (color_scheme === "dark") {
            shared.setCookiesForSettings(result["dark-options"], tab0_url);
          }
        });
      }
    },
  );
}

// update when the tab is updated
browser.tabs.onUpdated.addListener(cookieUpdate);
