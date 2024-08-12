/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{src,dist}/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "ddg-orange": "#dd5733",

        "ddg-light-title": "##190CAA",

        "ddg-dark-bg": "#212121",
        "ddg-dark-title": "#50f148",
        "ddg-dark-on-button": "#7194F6",
        "ddg-dark-off-button": "#333333",
      },
    },
  },
  plugins: ["tailwindcss ,autoprefixer"],
};
