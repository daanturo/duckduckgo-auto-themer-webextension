const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    "options/options.js": "./src/options/options",
    "background.js": "./src/background",
    "shared.js": "./src/shared",
  },
  output: {
    path: path.join(__dirname, "extension", "dist"),
    filename: "[name]",
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: ["/node_modules/"],
        use: {
          loader:
            // "babel-loader",
            // "ts-loader",
            "swc-loader",
          options: {
            parseMap: true,
          },
        },
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.join(__dirname, "src"), "node_modules"],
  },
  devtool: "inline-source-map",
  plugins: [
    // Uncaught ReferenceError: process is not defined
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
  mode: "none",
};
