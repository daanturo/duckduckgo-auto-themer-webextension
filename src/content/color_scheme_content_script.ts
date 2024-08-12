import * as shared from "../shared";
import { browser, storageGetSyncOrManaged } from "../shared";

browser.runtime.onMessage.addListener(
  // just color scheme getter for Chromium
  function (request, sender, sendResponse) {
    const color_scheme = shared.getSystemColorScheme();
    return sendResponse({ color_scheme: color_scheme });
  },
);
