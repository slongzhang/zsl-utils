// const webpack = require('webpack');
const dayjs = require('dayjs');
const path = require('path');
const webpack = require('webpack');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const bannerContent = `
name: 'zsl utils'
email: 'slongzhang'
date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}
`;

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'zsl.utils.js',
    libraryTarget: 'umd', // 导出类型
    library: 'zsl' // 导出全局变量名
  },

  // entry: {
  //   'content': './src/content/index.js',
  //   'background': './src/background/index.js'
  // },
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   filename: '[name]/index.js'
  // },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      }
    }]
  },
  plugins: [
    // new UglifyJsPlugin(),
    new webpack.BannerPlugin(bannerContent)
  ]
};
