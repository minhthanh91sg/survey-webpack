const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: ["regenerator-runtime/runtime.js",'./src/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: './dist',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                "targets": "defaults" 
              }],
              ["@babel/preset-react", {"runtime": "automatic"}]
            ]
          }
        }]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // fix "process is not defined" error:
    // (do "npm install process" before running the build)
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "public", to: path.resolve(__dirname, 'dist/public') },
      ],
    }),
  ],
  resolve: {
    fallback: {
    "fs": false,
    //"tls": false,
    //"net": false,
    //"path": false,
    //"zlib": false,
    //"http": false,
    //"https": false,
    "assert": require.resolve("assert/"),
    "crypto": require.resolve("crypto-browserify"),
    "os": require.resolve("os-browserify/browser"),
    //"buffer": false,
    "stream": require.resolve("stream-browserify"),
    //"util": require.resolve("util/"),
    "path": require.resolve("path-browserify"),
    "buffer": require.resolve("buffer"),
    "worker_threads": false,
    "ethers": require.resolve("ethers/")
    },
    alias: {
        process: "process/browser"
    }
  }
};