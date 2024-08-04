function onError(error) {
  console.log(`Error: ${JSON.stringify(error)}`);
}

function convertStringToJsonMaybe(
  string,
  alert_flag = false,
  json_err_retval = null,
) {
  if (
    !(typeof string === "string" || string instanceof String) ||
    string === ""
  ) {
    return null;
  }
  if (/^\s+$/.test(string)) {
    // treat spaces as nothing
    return string;
  }
  try {
    return JSON.parse(string);
  } catch (err) {
    const msg = `${err}\n"${string}"`;
    if (alert_flag) {
      // setTimeout(function () { }, 0);
      alert(msg);
    }
    console.log(msg);
    return json_err_retval;
  }
}
function convertJsonToStringMaybe(obj) {
  if (obj === undefined || obj === null) return null;
  if (typeof obj === "string" || obj instanceof String) return obj;
  return JSON.stringify(obj, null, 2);
}

async function restoreOptions() {
  const shared = await import(browser.runtime.getURL("shared/shared.js"));

  var html_elem;

  populateThemeLists(shared.themeListSorted(), {
    default_themes: shared.DDG_DEFAULT_THEME,
  });

  browser.storage.sync
    .get([
      "light-theme",
      "dark-theme",
      "shared-options",
      "light-options",
      "dark-options",
    ])
    .then(function (result) {
      try {
        const color_scheme = shared.getSystemColorScheme();

        shared.getThemeFromCookies().then(function (theme_from_cookies) {
          try {
            // order of pre-selected radio choice: from saved options / from cookies / extension default
            const light_theme =
              result["light-theme"] ||
              (color_scheme === "light" && theme_from_cookies) ||
              shared.EXT_DEFAULT_THEME["light"];

            const dark_theme =
              result["dark-theme"] ||
              (color_scheme === "dark" && theme_from_cookies) ||
              shared.EXT_DEFAULT_THEME["dark"];

            html_elem = document.querySelector(
              `input[name="light-theme"][value="${light_theme}"]`,
            );
            if (html_elem) {
              html_elem.checked = true;
            }

            html_elem = document.querySelector(
              `input[name="dark-theme"][value="${dark_theme}"]`,
            );
            if (html_elem) {
              html_elem.checked = true;
            }
          } catch (err) {
            console.log(`restoreOptions theme radio Error`, err);
          }
        });

        html_elem = document.querySelector("#shared-options");
        html_elem.value = convertJsonToStringMaybe(result["shared-options"]);

        html_elem.placeholder =
          shared.EXT_DEFAULT_SHARED_OPTIONSC_COMMENT +
          "\n" +
          JSON.stringify(shared.EXT_DEFAULT_SHARED_OPTIONS, null, 2);

        html_elem.rows = Math.max(
          4,
          (html_elem.placeholder || "").split(/\n/).length + 1,
        );

        document.querySelector("#light-options").value =
          convertJsonToStringMaybe(result["light-options"]);

        document.querySelector("#dark-options").value =
          convertJsonToStringMaybe(result["dark-options"]);
      } catch (err) {
        console.log(`restoreOptions Error`, err);
      }
    });
}

function populateThemeLists(theme_lst = [], { default_themes } = {}) {
  ["light", "dark"].forEach(function (color_scheme) {
    const theme_list = theme_lst;

    const theme_list_elem = document.querySelector(
      `#${color_scheme}-theme-list`,
    );

    theme_list.forEach(function (theme) {
      const radio_choice = document.createElement("input");
      radio_choice.type = "radio";
      radio_choice.name = `${color_scheme}-theme`;
      radio_choice.id = `${color_scheme}-${theme}`;
      radio_choice.value = theme;
      theme_list_elem.appendChild(radio_choice);

      const label = document.createElement("label");
      label.setAttribute("for", `${color_scheme}-${theme}`);

      const preview_div = document.createElement("div");
      preview_div.setAttribute("class", "theme-preview");
      const img = document.createElement("img");
      img.src = `./images/themes/${theme}.webp`;
      preview_div.appendChild(img);

      label.appendChild(preview_div);
      var label_txt = `${theme} `;
      if (theme === default_themes[color_scheme]) {
        label_txt += `(scheme's default)`;
      }
      // label.appendChild(document.createElement("br"));
      label.appendChild(document.createTextNode(`\n\n${label_txt}`));

      theme_list_elem.appendChild(label);
    });
  });
}

async function saveOptions(e = null) {
  const shared = await import(browser.runtime.getURL("shared/shared.js"));
  if (e) {
    e.preventDefault();
  }

  const JSON_ERR = "JSON ERROR";

  var html_elem;
  var json_obj;

  html_elem = document.querySelector('input[name="light-theme"]:checked');
  const light_theme = html_elem.value || null;

  html_elem = document.querySelector('input[name="dark-theme"]:checked');
  const dark_theme = html_elem.value || null;

  html_elem = document.querySelector("#shared-options");
  json_obj = convertStringToJsonMaybe(html_elem.value, true, JSON_ERR);
  if (JSON_ERR === json_obj) return;
  const shared_options = json_obj;

  html_elem = document.querySelector("#light-options");
  json_obj = convertStringToJsonMaybe(html_elem.value, true, JSON_ERR);
  if (JSON_ERR === json_obj) return;
  const light_options = json_obj;

  html_elem = document.querySelector("#dark-options");
  json_obj = convertStringToJsonMaybe(html_elem.value, true, JSON_ERR);
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
      const msg = `${JSON.stringify(err)}`;
      alert(msg);
      console.log(msg);
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);

// can't put onClick= on the HTML page
document.querySelector("#save-button").addEventListener("click", saveOptions);

// populateThemeLists();
