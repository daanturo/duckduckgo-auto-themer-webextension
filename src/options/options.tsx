import { ReactDOM, useEffect, useState } from "react";

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import * as shared from "../shared";
import { browser, storageGetSyncOrManaged } from "../shared";

import _ from "lodash";

import "../main.css";

import { twMerge } from "tailwind-merge";

//// * Utils

function convertStringToJsonMaybe(
  s: string | null | String,
  alert_flag = false,
  json_err_retval = null,
) {
  if (!(typeof s === "string" || s instanceof String) || s === "") {
    return null;
  }

  // if (/^\s+$/.test(s)) {
  //   // treat spaces as nothing
  //   return s;
  // }

  try {
    return JSON.parse(s);
  } catch (err) {
    const msg = `${err}\n"${s}"`;
    if (alert_flag) {
      // setTimeout(function () { }, 0);
      alert(msg);
    }
    console.log(msg);
    return json_err_retval;
  }
}
function convertJsonToStringMaybe(obj: null | object) {
  if (obj === undefined || obj === null) return null;
  if (typeof obj === "string" || obj instanceof String) return obj;
  return JSON.stringify(obj, null, 2);
}

//// * Events

function saveOptions(
  light_theme_str,
  dark_theme_str,
  shared_options_str,
  light_options_str,
  dark_options_str,
) {
  const JSON_ERR = "JSON ERROR";

  var html_elem;
  var json_obj;

  const light_theme = light_theme_str || null;

  const dark_theme = dark_theme_str || null;

  json_obj = convertStringToJsonMaybe(shared_options_str, true, JSON_ERR);
  if (JSON_ERR === json_obj) return;
  const shared_options = json_obj;

  json_obj = convertStringToJsonMaybe(light_options_str, true, JSON_ERR);
  if (JSON_ERR === json_obj) return;
  const light_options = json_obj;

  json_obj = convertStringToJsonMaybe(dark_options_str, true, JSON_ERR);
  if (JSON_ERR === json_obj) return;
  const dark_options = json_obj;

  const saving_options = {
    "light-theme": light_theme,
    "dark-theme": dark_theme,
    "shared-options": shared_options,
    "light-options": light_options,
    "dark-options": dark_options,
  };

  browser.storage.sync
    .set(saving_options)
    .then(function (result) {
      alert(
        "Saved!",
        // `Saved:
        // ${JSON.stringify(saving_options, null, 2)}`
      );
      // console.log(result);
    })
    .catch(function (err) {
      const msg = `Error: ${JSON.stringify(err)}`;
      alert(msg);
      console.log(msg);
    });
}

function resetOptions(callback = null) {
  const saving_options = {
    "light-theme": null,
    "dark-theme": null,
    "shared-options": null,
    "light-options": null,
    "dark-options": null,
  };

  browser.storage.sync
    .set(saving_options)
    .then(function (result) {
      if (callback) callback();
      alert("Reset!");
    })
    .catch(function (err) {
      const msg = `Error: ${err}`;
      alert(msg);
      console.log(msg);
    });
}

//// * Components

//// ** Wrappers

function Heading(props) {
  const lv = props.lv;
  const HTag = `h${lv}`;
  const classes =
    "font-bold " +
    (lv === "2"
      ? "text-4xl text-[#190CAA] dark:text-ddg-dark-title"
      : lv === "3"
        ? "text-2xl"
        : "");
  return (
    <HTag
      {..._.omit(props, ["lv", "className"])}
      className={twMerge(classes, props.className)}
    ></HTag>
  );
}

function TextArea(props) {
  return (
    <textarea
      {..._.omit(props, "className")}
      className={twMerge(
        "block w-3/4 p-4 ring focus:outline-none rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-orange-500 dark:bg-[#333333]",
        `${props.className}`,
      )}
    ></textarea>
  );
}

function Button(props) {
  // border-2 border
  return (
    <button
      {..._.omit(props, "className")}
      className={twMerge(
        "hover:bg-ddg-orange hover:text-white hover:font-bold bg-[#F5F5F5] rounded-lg w-32 h-12 inline-flex flex-col items-center justify-center px-5 group transition-colors duration-300",
        `${props.className}`,
      )}
    ></button>
  );
}

function Link(props) {
  // border-2 border
  return (
    <a
      {..._.omit(props, "className")}
      className={twMerge("text-blue-500", `${props.className}`)}
    ></a>
  );
}

//// ** Custom

function ThemePicker({
  scheme,
  selected,
  setter,
}: {
  scheme: string;
  selected: string | null;
  setter: (any) => any;
}) {
  function onChange(e) {
    setter((_) => e.target.value);
  }

  const div_id = `${scheme}-theme-list`;
  const theme_names = shared.themeListSorted();
  const theme_radios = theme_names.map(function (theme) {
    const scheme_theme_name = `${scheme}-${theme}`;
    const default_note =
      theme === shared.DDG_DEFAULT_THEME[scheme] ? " (scheme's default)" : "";
    const label_txt = `${shared.capitalize(theme)}${default_note}`;
    return (
      <>
        <input
          type="radio"
          name={`${scheme}-theme`}
          id={`${scheme_theme_name}`}
          value={`${theme}`}
          checked={theme === selected}
          onChange={function () {
            setter((_) => theme);
          }}
        />
        <label htmlFor={`${scheme_theme_name}`}>
          <div className="theme-preview overflow-hidden rounded-xl border">
            <img src={`../../images/${theme}.webp`} className="scale-110" />
          </div>
          {label_txt}
        </label>
      </>
    );
  });
  return (
    <>
      <Heading lv="3"> {shared.capitalize(scheme) + " theme"}</Heading>
      <br />
      <div className="themes-list flex flex-row" id={div_id}>
        <br />
        {theme_radios}
      </div>
    </>
  );
}

function ThemePickerList({ light, light_setter, dark, dark_setter }) {
  return (
    <div>
      <Heading lv="2">
        Theme
        <a id="footnote-1-ref" href="#footnote-1">
          {" "}
          <sup>[1]</sup>{" "}
        </a>
      </Heading>
      <br />
      <ThemePicker scheme={"light"} selected={light} setter={light_setter} />
      <br />
      <ThemePicker scheme={"dark"} selected={dark} setter={dark_setter} />
    </div>
  );
}

function SharedOptionsBox({ saved, setter }) {
  const placeholder =
    shared.EXT_DEFAULT_SHARED_OPTIONSC_COMMENT +
    "\n" +
    JSON.stringify(shared.EXT_DEFAULT_SHARED_OPTIONS, null, 2);
  const placeholder_rows = Math.max(
    4,
    (placeholder || "").split(/\n/).length + 1,
  );
  const curly_braces = "{}";
  return (
    <div>
      <Heading lv="2">Shared settings</Heading>
      <br />
      In JSON format like{" "}
      <Link href="https://duckduckgo.com/settings">
        duckduckgo.com/settings
      </Link>{" "}
      / "Show Bookmarklet and Settings Data" / "Settings in JSON".
      <br />
      You can type "{curly_braces}" to override the extension's defaults.
      <br />
      <br />
      <TextArea
        id="shared-options"
        placeholder={placeholder}
        rows={placeholder_rows}
        onChange={(e) => setter(e.target.value)}
        value={saved}
      ></TextArea>
    </div>
  );
}

function SchemeSpecficBoxes({ light, light_setter, dark, dark_setter }) {
  return (
    <div id="theme-specific">
      <Heading lv="2">Scheme-specific settings</Heading>
      <br />
      The same JSON format as Shared options.
      <br /> <br />
      <div>
        <Heading lv="3">Light-specific settings</Heading>
        <br />
        <TextArea
          id="light-options"
          placeholder="{}"
          onChange={(e) => light_setter(e.target.value)}
          value={light}
        ></TextArea>
      </div>
      <br />
      <div>
        <Heading lv="3">Dark-specific settings</Heading>
        <br />
        <TextArea
          id="dark-options"
          placeholder="{}"
          onChange={(e) => dark_setter(e.target.value)}
          value={dark}
        ></TextArea>
      </div>
    </div>
  );
}

function FootNote() {
  return (
    <div>
      {" "}
      <p id="footnote-1">
        1. Please report if this preview theme list is outdated, thank you.
        <a href="#footnote-1-ref">↩</a>
      </p>
    </div>
  );
}

function Bottom({ saveFn, resetFn }) {
  // const button_style = { float: "right" };
  return (
    <div>
      <FootNote />
      <br /> <br /> <br /> <br />
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 bg-[#F2F2F2] dark:bg-[#272727] dark:border-gray-600">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium space-x-4 float-right items-center">
          <Button
            id="save-button"
            className="save-button bg-ddg-dark-on-button text-white font-bold "
            onClick={saveFn}
          >
            Save
          </Button>
          <Button
            id="reset-button"
            className="reset-button dark:bg-ddg-dark-off-button"
            onClick={resetFn}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

function Page() {
  const [light_theme, setLightTheme] = useState(null);
  const [dark_theme, setDarkTheme] = useState(null);
  const [shared_options, setSharedOptions] = useState(null);
  const [light_options, setLightOptions] = useState(null);
  const [dark_options, setDarkOptions] = useState(null);
  const [initFlag, setInitFlag] = useState(true);

  function initialize(force = false) {
    if (initFlag || force) {
      storageGetSyncOrManaged([
        "light-theme",
        "dark-theme",
        "shared-options",
        "light-options",
        "dark-options",
      ]).then(function (result) {
        setInitFlag(false);
        try {
          const color_scheme = shared.getSystemColorScheme();

          try {
            // order of pre-selected radio choice: from saved options / extension default
            if (light_theme === null || force) {
              setLightTheme(
                result["light-theme"] || shared.EXT_DEFAULT_THEME["light"],
              );
            }
            if (dark_theme === null || force) {
              setDarkTheme(
                result["dark-theme"] || shared.EXT_DEFAULT_THEME["dark"],
              );
            }
          } catch (err) {
            console.log(`restoreOptions theme radio Error`, err);
          }

          if (shared_options === null || force) {
            setSharedOptions(
              convertJsonToStringMaybe(result["shared-options"]),
            );
          }
          if (light_options === null || force) {
            setLightOptions(convertJsonToStringMaybe(result["light-options"]));
          }
          if (dark_options === null || force) {
            setDarkOptions(convertJsonToStringMaybe(result["dark-options"]));
          }
        } catch (err) {
          console.log(`restoreOptions Error`, err);
        }
      });
    }
  }

  function saveFn() {
    saveOptions(
      light_theme,
      dark_theme,
      shared_options,
      light_options,
      dark_options,
    );
  }
  function resetFn() {
    setLightTheme(null);
    setDarkTheme(null);
    setSharedOptions("");
    setLightOptions("");
    setDarkOptions("");
    resetOptions(() => {
      initialize(true);
    });
  }

  initialize();

  return (
    <div className="dark:text-[#EEEEEE] dark:bg-ddg-dark-bg px-40">
      <br />
      <ThemePickerList
        light={light_theme}
        light_setter={setLightTheme}
        dark={dark_theme}
        dark_setter={setDarkTheme}
      />
      <br />
      <SharedOptionsBox saved={shared_options} setter={setSharedOptions} />
      <br />
      <SchemeSpecficBoxes
        light={light_options}
        light_setter={setLightOptions}
        dark={dark_options}
        dark_setter={setDarkOptions}
      />
      <br /> <br /> <br />
      <Bottom saveFn={saveFn} resetFn={resetFn} />
    </div>
  );
}

//// * Render

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
