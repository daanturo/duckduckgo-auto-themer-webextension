import _ from "lodash";

export const DDG_DOMAIN = "duckduckgo.com";

export const THEME_KEY = "ae";

export const THEME_TABLE = {
  default: { "cookie-value": "-1", "color-scheme": "light", order: 0 },
  basic: { "cookie-value": "b", "color-scheme": "light", order: 1 },
  contrast: { "cookie-value": "c", "color-scheme": "light", order: 2 },
  dark: { "cookie-value": "d", "color-scheme": "dark", order: 3 },
  gray: { "cookie-value": "g", "color-scheme": "light", order: 4 },
  terminal: { "cookie-value": "t", "color-scheme": "light", order: 5 },
};

export function themeListSorted() {
  const names = Object.keys(THEME_TABLE);
  return names.sort(function (theme0, theme1) {
    return THEME_TABLE[theme0].order - THEME_TABLE[theme1].order;
  });
}

export const DDG_SETTINGS_KEYS_PREFIX = "k";

export var DEBUG = false;

export const EXT_DEFAULT_THEME = {
  light: "default",
  dark: "terminal",
};

export const DDG_DEFAULT_THEME = {
  light: "default",
  dark: "dark",
};

export const EXT_DEFAULT_SHARED_OPTIONS = {
  // Font: browser's default sans-serif
  kt: "n",
  // Title Font: default browser's sans-serif
  ka: "n",
  // Infinite Scroll
  kav: "1",
};

export const EXT_DEFAULT_SHARED_OPTIONSC_COMMENT =
  "// Use browser's default sans-serif font for body and title, and enable infinite scrolling.";

export function isString(obj) {
  return typeof obj === "string" || obj instanceof String;
}

export function parseJsonMaybe(s) {
  if (!isString(s)) return null;
  try {
    return JSON.parse(s);
  } catch (err) {
    return null;
  }
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function getThemeFromCookies() {
  const cookie_obj = await browser.cookies.get({
    url: `https://${DDG_DOMAIN}`,
    name: THEME_KEY,
  });
  const theme_value = cookie_obj ? cookie_obj["value"] : null;
  // Reversed lookup: from the cookies's value, get the THEME name back
  return Object.keys(THEME_TABLE).find(
    (key) => theme_value === THEME_TABLE[key]["cookie-value"],
  );
}

export function getSystemColorScheme() {
  if (window.matchMedia === undefined) return undefined;
  const dark_flag = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return dark_flag ? "dark" : "light";
}

export function setCookiesForSettings(
  json_settings,
  url,
  { other_details = {}, remove_key_prefix = true, exclude_names = [] } = {},
) {
  if (!json_settings || isString(json_settings)) return;

  const json_obj = json_settings;

  Object.keys(json_obj).forEach(function (kname) {
    const cookie_name = remove_key_prefix
      ? kname.slice(DDG_SETTINGS_KEYS_PREFIX.length)
      : kname;
    if (exclude_names.includes(cookie_name)) {
      if (DEBUG) {
        console.log(
          `${browser.runtime.getManifest().name} / setCookiesForSettings : told to ignore existing cookie named "${cookie_name}".`,
        );
      }
    } else {
      var cookie = { url: url, ...other_details };
      cookie["name"] = cookie_name;
      cookie["value"] = json_obj[kname];
      browser.cookies.set(cookie).catch(function (err) {
        console.log(
          `${browser.runtime.getManifest().name} / setCookiesForSettings : `,
          JSON.stringify(cookie),
          err,
        );
      });
    }
  });
}

export function isNil(arg) {
  return arg === undefined || arg === null;
}

export async function storageGetSyncOrManaged(keys: string[]) {
  let managed = {};
  try {
    managed = await browser.storage.sync.get(keys);
  } catch (err) {
    console.log(`storageGetSyncOrManaged ${keys} ${err}`);
  }
  const sync = await browser.storage.sync.get(keys);
  // Prioritize user's configs
  return { ..._.pickBy(managed, (v) => !isNil(v)), ...sync };
}
