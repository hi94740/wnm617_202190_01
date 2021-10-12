const Path = require("path")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

/**
 * @type { import("webpack").Configuration }
 */

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: Path.resolve(__dirname, "dist")
  },
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              url: false
            }
          },
          "less-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".less"]
  },
  plugins: [new BundleAnalyzerPlugin()]
}
